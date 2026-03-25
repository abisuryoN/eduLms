<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Services\AbsensiService;
use App\Services\MateriService;
use App\Services\NotifikasiService;
use App\Services\QuizService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DosenController extends Controller
{
    public function __construct(
        private AbsensiService    $absensiService,
        private MateriService     $materiService,
        private QuizService       $quizService,
        private NotifikasiService $notifikasiService,
    ) {}

    /* ══════════════════════════════════════════════
     *  JADWAL
     * ══════════════════════════════════════════════ */

    public function jadwalHariIni(Request $request): JsonResponse
    {
        $dosen = $request->user()->dosen;
        $hari  = Carbon::now()->locale('id')->isoFormat('dddd'); // Senin, Selasa, etc.

        $jadwal = \App\Models\Jadwal::whereHas('kelas', fn($q) => $q->where('dosen_id', $dosen->id))
            ->where('hari', $hari)
            ->with('kelas.mataKuliah', 'kelas.mahasiswa')
            ->orderBy('jam_mulai')
            ->get();

        return response()->json($jadwal);
    }

    public function kelasList(Request $request): JsonResponse
    {
        $dosen = $request->user()->dosen;

        $kelas = Kelas::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'mahasiswa.user', 'jadwal'])
            ->withCount('mahasiswa')
            ->orderByDesc('id')
            ->get();

        return response()->json($kelas);
    }

    /* ══════════════════════════════════════════════
     *  ABSENSI
     * ══════════════════════════════════════════════ */

    public function kelasMahasiswa(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $mahasiswa = $kelas->mahasiswa()->with('user')->orderBy('nim')->get();

        return response()->json($mahasiswa);
    }

    public function submitAbsensi(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'pertemuan'              => 'required|integer|min:1|max:16',
            'tanggal'                => 'required|date',
            'records'                => 'required|array|min:1',
            'records.*.mahasiswa_id' => 'required|exists:mahasiswa,id',
            'records.*.status'       => 'required|in:hadir,izin,alpha',
        ]);

        $result = $this->absensiService->submitPertemuan(
            $kelas->id,
            $data['pertemuan'],
            $data['records'],
            $data['tanggal']
        );

        return response()->json([
            'message' => "Absensi berhasil. {$result['created']} tercatat, {$result['skipped']} sudah ada.",
            ...$result,
        ]);
    }

    public function getAbsensiKelas(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $absensi = \App\Models\Absensi::where('kelas_id', $kelas->id)
            ->with('mahasiswa.user')
            ->orderBy('pertemuan')
            ->get()
            ->groupBy('pertemuan');

        return response()->json($absensi);
    }

    /* ══════════════════════════════════════════════
     *  MATERI
     * ══════════════════════════════════════════════ */

    public function materiIndex(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        return response()->json($this->materiService->getByKelas($kelas->id));
    }

    public function materiStore(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'pertemuan' => 'required|integer|min:1|max:16',
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tipe'      => 'required|in:file,link,video',
            'url'       => 'nullable|url',
            'file'      => 'nullable|file|max:10240',
        ]);

        $data['kelas_id'] = $kelas->id;
        $materi = $this->materiService->create($data, $request->file('file'));

        return response()->json($materi, 201);
    }

    public function materiUpdate(Request $request, Kelas $kelas, \App\Models\Materi $materi): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'pertemuan' => 'sometimes|integer|min:1|max:16',
            'judul'     => 'sometimes|string|max:255',
            'deskripsi' => 'nullable|string',
            'tipe'      => 'sometimes|in:file,link,video',
            'url'       => 'nullable|url',
            'file'      => 'nullable|file|max:10240',
        ]);

        $materi = $this->materiService->update($materi, $data, $request->file('file'));

        return response()->json($materi);
    }

    public function materiDestroy(Request $request, Kelas $kelas, \App\Models\Materi $materi): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $this->materiService->delete($materi);

        return response()->json(['message' => 'Materi dihapus.']);
    }

    /* ══════════════════════════════════════════════
     *  QUIZ
     * ══════════════════════════════════════════════ */

    public function quizIndex(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        return response()->json(
            \App\Models\Quiz::where('kelas_id', $kelas->id)
                ->withCount('soal')
                ->orderByDesc('id')
                ->get()
        );
    }

    public function quizStore(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'judul'                  => 'required|string|max:255',
            'deskripsi'              => 'nullable|string',
            'durasi_menit'           => 'required|integer|min:1',
            'pertemuan'              => 'nullable|integer|min:1|max:16',
            'is_active'              => 'boolean',
            'soal'                   => 'required|array|min:1',
            'soal.*.pertanyaan'      => 'required|string',
            'soal.*.opsi_a'          => 'required|string',
            'soal.*.opsi_b'          => 'required|string',
            'soal.*.opsi_c'          => 'required|string',
            'soal.*.opsi_d'          => 'required|string',
            'soal.*.jawaban_benar'   => 'required|in:a,b,c,d',
            'soal.*.poin'            => 'integer|min:1',
        ]);

        $quizData = collect($data)->except('soal')->merge(['kelas_id' => $kelas->id])->toArray();
        $quiz = $this->quizService->create($quizData, $data['soal']);

        return response()->json($quiz, 201);
    }

    public function quizUpdate(Request $request, Kelas $kelas, \App\Models\Quiz $quiz): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'judul'        => 'sometimes|string|max:255',
            'deskripsi'    => 'nullable|string',
            'durasi_menit' => 'sometimes|integer|min:1',
            'is_active'    => 'boolean',
        ]);

        $quiz = $this->quizService->update($quiz, $data);

        return response()->json($quiz);
    }

    /* ══════════════════════════════════════════════
     *  NOTIFIKASI
     * ══════════════════════════════════════════════ */

    public function sendNotifikasi(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'pesan' => 'required|string',
        ]);

        $count = $this->notifikasiService->sendToKelas($kelas->id, $data['judul'], $data['pesan'], 'dosen');

        return response()->json([
            'message' => "Notifikasi dikirim ke {$count} mahasiswa.",
        ]);
    }

    /* ══════════════════════════════════════════════
     *  CHAT
     * ══════════════════════════════════════════════ */

    public function chatIndex(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $messages = \App\Models\Chat::where('kelas_id', $kelas->id)
            ->with('user:id,name,avatar,role')
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json($messages);
    }

    public function chatSend(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate(['pesan' => 'required|string|max:1000']);

        $chat = \App\Models\Chat::create([
            'kelas_id' => $kelas->id,
            'user_id'  => $request->user()->id,
            'pesan'    => $data['pesan'],
        ]);

        return response()->json($chat->load('user:id,name,avatar'), 201);
    }

    /* ══════════════════════════════════════════════
     *  NILAI
     * ══════════════════════════════════════════════ */

    public function nilaiIndex(Kelas $kelas, Request $request): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $nilai = \App\Models\Nilai::where('kelas_id', $kelas->id)
            ->with('mahasiswa.user')
            ->get();

        return response()->json($nilai);
    }

    public function nilaiStore(Request $request, Kelas $kelas): JsonResponse
    {
        $this->authorizeDosenKelas($request, $kelas);

        $data = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'tugas'        => 'required|numeric|min:0|max:100',
            'uts'          => 'required|numeric|min:0|max:100',
            'uas'          => 'required|numeric|min:0|max:100',
        ]);

        $total = ($data['tugas'] * 0.3) + ($data['uts'] * 0.3) + ($data['uas'] * 0.4);
        $grade = $this->calculateGrade($total);

        $nilai = \App\Models\Nilai::updateOrCreate(
            ['kelas_id' => $kelas->id, 'mahasiswa_id' => $data['mahasiswa_id']],
            [
                'tugas' => $data['tugas'],
                'uts'   => $data['uts'],
                'uas'   => $data['uas'],
                'total' => round($total, 2),
                'grade' => $grade,
            ]
        );

        return response()->json($nilai);
    }

    /* ══════════════════════════════════════════════
     *  HELPERS
     * ══════════════════════════════════════════════ */

    private function authorizeDosenKelas(Request $request, Kelas $kelas): void
    {
        $dosenId = $request->user()->dosen->id;

        // Check if main pengajar (legacy)
        if ($kelas->dosen_id === $dosenId) return;

        // Check if in teaching assignments
        $isPengajar = $kelas->teachingAssignments()->where('dosen_id', $dosenId)->exists();
        if ($isPengajar) return;

        // Check if PA
        $isPA = $kelas->pembimbingAkademik()->where('dosen_id', $dosenId)->exists();
        if ($isPA) return;

        abort(403, 'Anda tidak memiliki akses ke kelas ini.');
    }

    private function calculateGrade(float $total): string
    {
        return match (true) {
            $total >= 85 => 'A',
            $total >= 80 => 'A-',
            $total >= 75 => 'B+',
            $total >= 70 => 'B',
            $total >= 65 => 'B-',
            $total >= 60 => 'C+',
            $total >= 55 => 'C',
            $total >= 50 => 'C-',
            $total >= 45 => 'D',
            default      => 'E',
        };
    }
}
