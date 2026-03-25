<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Kelas;
use App\Services\AbsensiService;
use App\Services\QuizService;
use App\Services\SemesterService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MahasiswaController extends Controller
{
    public function __construct(
        private AbsensiService  $absensiService,
        private QuizService     $quizService,
        private SemesterService $semesterService,
    ) {}

    /* ══════════════════════════════════════════════
     *  DASHBOARD
     * ══════════════════════════════════════════════ */

    public function dashboard(Request $request): JsonResponse
    {
        $user      = $request->user();
        
        // Handle roles and missing records gracefully
        if ($user->isAdmin()) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'nama'           => $user->name,
                    'nim'            => 'ADMIN',
                    'semester'       => '-',
                    'prodi'          => 'Administrator System',
                    'total_kelas'    => \App\Models\Kelas::count(),
                    'jadwal_hari_ini' => [],
                ]
            ]);
        }

        $mahasiswa = $user->mahasiswa;
        if (!$mahasiswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data mahasiswa tidak ditemukan untuk akun ini.'
            ], 404);
        }

        $kelasList = $mahasiswa->kelas()
            ->with(['mataKuliah', 'dosen.user', 'jadwal', 'prodi.fakultas', 'teachingAssignments.dosen.user'])
            ->get();

        // Jadwal hari ini
        $hari = Carbon::now()->locale('id')->isoFormat('dddd');
        $jadwalHariIni = [];
        foreach ($kelasList as $kelas) {
            foreach ($kelas->jadwal as $jadwal) {
                if ($jadwal->hari === $hari) {
                    $jadwalHariIni[] = [
                        'kelas'      => ($kelas->mataKuliah->nama ?? 'N/A') . ' (' . $kelas->nama_kelas . ')',
                        'dosen'      => $kelas->teachingAssignments->first()?->dosen->user->name ?? $kelas->dosen->user->name ?? '-',
                        'jam_mulai'  => $jadwal->jam_mulai,
                        'jam_selesai' => $jadwal->jam_selesai,
                        'gedung'     => $jadwal->gedung,
                        'ruangan'    => $jadwal->ruangan,
                    ];
                }
            }
        }

        // Calculate total subjects (Active Classes definition)
        $totalSubjects = $kelasList->flatMap(fn($k) => $k->subjects)
            ->pluck('id')
            ->unique()
            ->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'nama'           => $user->name,
                'nim'            => $mahasiswa->nim,
                'semester'       => $mahasiswa->semester,
                'prodi'          => $mahasiswa->prodi?->nama,
                'total_kelas'    => $totalSubjects, // Use standardized subject count
                'total_subjects' => $totalSubjects, 
                'jadwal_hari_ini' => $jadwalHariIni,
            ]
        ]);
    }

    /* ══════════════════════════════════════════════
     *  JADWAL
     * ══════════════════════════════════════════════ */

    public function jadwal(Request $request): JsonResponse
    {
        $mahasiswa = $request->user()->mahasiswa;

        $jadwal = \App\Models\Jadwal::whereHas('kelas.mahasiswa', fn($q) => $q->where('mahasiswa.id', $mahasiswa->id))
            ->with(['kelas.mataKuliah', 'kelas.dosen.user', 'kelas.teachingAssignments.dosen.user'])
            ->orderByRaw("FIELD(hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')")
            ->orderBy('jam_mulai')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $jadwal
        ]);
    }

    /* ══════════════════════════════════════════════
     *  KELAS & MATERI
     * ══════════════════════════════════════════════ */

    public function kelasList(Request $request): JsonResponse
    {
        $user = $request->user();
        \Illuminate\Support\Facades\Log::info("Fetching classes for user: {$user->email} (Role: {$user->role})");

        $query = \App\Models\Kelas::with(['mataKuliah', 'dosen.user', 'prodi.fakultas', 'teachingAssignments.dosen.user'])
            ->withCount('materi');

        if ($user->isAdmin()) {
            $kelas = $query->latest()->get();
            \Illuminate\Support\Facades\Log::info('Admin detected, returning all ' . $kelas->count() . ' classes.');
        } elseif ($user->isDosen()) {
            if (!$user->dosen) {
                \Illuminate\Support\Facades\Log::warning("User {$user->email} has role 'dosen' but no 'dosen' record.");
                $kelas = collect([]);
            } else {
                $dosenId = $user->dosen->id;
                $kelas = $query->where(function ($q) use ($dosenId) {
                    $q->where('dosen_id', $dosenId)
                      ->orWhereHas('teachingAssignments', fn($sq) => $sq->where('dosen_id', $dosenId))
                      ->orWhereHas('pembimbingAkademik', fn($sq) => $sq->where('dosen_id', $dosenId));
                })->get();
                \Illuminate\Support\Facades\Log::info("Dosen ID {$dosenId} detected, returning " . $kelas->count() . " classes.");
            }
        } else {
            // Mahasiswa
            if (!$user->mahasiswa) {
                \Illuminate\Support\Facades\Log::warning("User {$user->email} has role 'mahasiswa' but no 'mahasiswa' record.");
                $kelas = collect([]);
            } else {
                $mahasiswaId = $user->mahasiswa->id;
                $kelas = $query->whereHas('mahasiswa', fn($q) => $q->where('mahasiswa.id', $mahasiswaId))->get();
                \Illuminate\Support\Facades\Log::info("Mahasiswa ID {$mahasiswaId} detected, returning " . $kelas->count() . " classes.");
            }
        }

        return response()->json([
            'success' => true,
            'data'    => $kelas
        ]);
    }

    public function materiByKelas(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $materi = \App\Models\Materi::where('kelas_id', $kelas->id)
            ->orderBy('pertemuan')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $materi
        ]);
    }

    /* ══════════════════════════════════════════════
     *  QUIZ
     * ══════════════════════════════════════════════ */

    public function quizByKelas(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $mahasiswaId = $request->user()->mahasiswa->id;

        $quizzes = \App\Models\Quiz::where('kelas_id', $kelas->id)
            ->where('is_active', true)
            ->withCount('soal')
            ->get()
            ->map(function ($quiz) use ($mahasiswaId) {
                $answered = \App\Models\JawabanMahasiswa::where('quiz_id', $quiz->id)
                    ->where('mahasiswa_id', $mahasiswaId)
                    ->exists();

                $quiz->sudah_dikerjakan = $answered;
                return $quiz;
            });

        return response()->json([
            'success' => true,
            'data'    => $quizzes
        ]);
    }

    public function quizDetail(Kelas $kelas, \App\Models\Quiz $quiz, Request $request): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $quiz->load('soal');
        // Hide jawaban_benar from students
        $quiz->soal->each(fn($s) => $s->makeHidden('jawaban_benar'));

        return response()->json([
            'success' => true,
            'data'    => $quiz
        ]);
    }

    public function submitQuiz(Request $request, Kelas $kelas, \App\Models\Quiz $quiz): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $data = $request->validate([
            'jawaban'            => 'required|array|min:1',
            'jawaban.*.soal_id'  => 'required|exists:soal,id',
            'jawaban.*.jawaban'  => 'required|in:a,b,c,d',
        ]);

        $mahasiswaId = $request->user()->mahasiswa->id;
        $result = $this->quizService->submitJawaban($quiz->id, $mahasiswaId, $data['jawaban']);

        return response()->json([
            'success' => true,
            'message' => 'Quiz berhasil dikumpulkan.',
            'data'    => $result,
        ]);
    }

    /* ══════════════════════════════════════════════
     *  NILAI
     * ══════════════════════════════════════════════ */

    public function nilai(Request $request): JsonResponse
    {
        $mahasiswaId = $request->user()->mahasiswa->id;

        $nilai = \App\Models\Nilai::where('mahasiswa_id', $mahasiswaId)
            ->with('kelas.mataKuliah')
            ->get()
            ->map(fn($n) => [
                'mata_kuliah' => $n->kelas->mataKuliah->nama ?? 'N/A',
                'sks'         => $n->kelas->mataKuliah->sks ?? 0,
                'tugas'       => $n->tugas,
                'uts'         => $n->uts,
                'uas'         => $n->uas,
                'total'       => $n->total,
                'grade'       => $n->grade,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $nilai
        ]);
    }

    /* ══════════════════════════════════════════════
     *  ABSENSI
     * ══════════════════════════════════════════════ */

    public function absensi(Request $request): JsonResponse
    {
        $mahasiswaId = $request->user()->mahasiswa->id;

        $data = $this->absensiService->getMahasiswaAbsensi($mahasiswaId);

        return response()->json([
            'success' => true,
            'data'    => $data
        ]);
    }

    /* ══════════════════════════════════════════════
     *  CHAT
     * ══════════════════════════════════════════════ */

    public function chatIndex(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $messages = Chat::where('kelas_id', $kelas->id)
            ->with('user:id,name,avatar,role')
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => $messages
        ]);
    }

    public function chatSend(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $data = $request->validate(['pesan' => 'required|string|max:1000']);

        $chat = Chat::create([
            'kelas_id' => $kelas->id,
            'user_id'  => $request->user()->id,
            'pesan'    => $data['pesan'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan terkirim.',
            'data'    => $chat->load('user:id,name,avatar')
        ], 201);
    }

    /* ══════════════════════════════════════════════
     *  HELPERS
     * ══════════════════════════════════════════════ */

    private function authorizeMahasiswaKelas(Request $request, Kelas $kelas): void
    {
        $mahasiswaId = $request->user()->mahasiswa->id;
        $enrolled = $kelas->mahasiswa()->where('mahasiswa.id', $mahasiswaId)->exists();

        if (!$enrolled) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }
    }
}
