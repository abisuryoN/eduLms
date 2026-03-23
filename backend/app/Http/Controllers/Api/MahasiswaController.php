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
        $mahasiswa = $user->mahasiswa;

        $kelasList = $mahasiswa->kelas()
            ->with(['mataKuliah', 'dosen.user', 'jadwal'])
            ->get();

        // Jadwal hari ini
        $hari = Carbon::now()->locale('id')->isoFormat('dddd');
        $jadwalHariIni = [];
        foreach ($kelasList as $kelas) {
            foreach ($kelas->jadwal as $jadwal) {
                if ($jadwal->hari === $hari) {
                    $jadwalHariIni[] = [
                        'kelas'      => $kelas->mataKuliah->nama . ' (' . $kelas->nama_kelas . ')',
                        'dosen'      => $kelas->dosen->user->name,
                        'jam_mulai'  => $jadwal->jam_mulai,
                        'jam_selesai' => $jadwal->jam_selesai,
                        'gedung'     => $jadwal->gedung,
                        'ruangan'    => $jadwal->ruangan,
                    ];
                }
            }
        }

        return response()->json([
            'nama'           => $user->name,
            'nim'            => $mahasiswa->nim,
            'semester'       => $mahasiswa->semester,
            'prodi'          => $mahasiswa->prodi?->nama,
            'total_kelas'    => $kelasList->count(),
            'jadwal_hari_ini' => $jadwalHariIni,
        ]);
    }

    /* ══════════════════════════════════════════════
     *  JADWAL
     * ══════════════════════════════════════════════ */

    public function jadwal(Request $request): JsonResponse
    {
        $mahasiswa = $request->user()->mahasiswa;

        $jadwal = \App\Models\Jadwal::whereHas('kelas.mahasiswa', fn($q) => $q->where('mahasiswa.id', $mahasiswa->id))
            ->with('kelas.mataKuliah', 'kelas.dosen.user')
            ->orderByRaw("FIELD(hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')")
            ->orderBy('jam_mulai')
            ->get();

        return response()->json($jadwal);
    }

    /* ══════════════════════════════════════════════
     *  KELAS & MATERI
     * ══════════════════════════════════════════════ */

    public function kelasList(Request $request): JsonResponse
    {
        $mahasiswa = $request->user()->mahasiswa;

        $kelas = $mahasiswa->kelas()
            ->with(['mataKuliah', 'dosen.user'])
            ->withCount('materi')
            ->get();

        return response()->json($kelas);
    }

    public function materiByKelas(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $materi = \App\Models\Materi::where('kelas_id', $kelas->id)
            ->orderBy('pertemuan')
            ->get();

        return response()->json($materi);
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

        return response()->json($quizzes);
    }

    public function quizDetail(Kelas $kelas, \App\Models\Quiz $quiz, Request $request): JsonResponse
    {
        $this->authorizeMahasiswaKelas($request, $kelas);

        $quiz->load('soal');
        // Hide jawaban_benar from students
        $quiz->soal->each(fn($s) => $s->makeHidden('jawaban_benar'));

        return response()->json($quiz);
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
            'message' => 'Quiz berhasil dikumpulkan.',
            ...$result,
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
                'mata_kuliah' => $n->kelas->mataKuliah->nama,
                'sks'         => $n->kelas->mataKuliah->sks,
                'tugas'       => $n->tugas,
                'uts'         => $n->uts,
                'uas'         => $n->uas,
                'total'       => $n->total,
                'grade'       => $n->grade,
            ]);

        return response()->json($nilai);
    }

    /* ══════════════════════════════════════════════
     *  ABSENSI
     * ══════════════════════════════════════════════ */

    public function absensi(Request $request): JsonResponse
    {
        $mahasiswaId = $request->user()->mahasiswa->id;

        $data = $this->absensiService->getMahasiswaAbsensi($mahasiswaId);

        return response()->json($data);
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

        return response()->json($messages);
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

        return response()->json($chat->load('user:id,name,avatar'), 201);
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
