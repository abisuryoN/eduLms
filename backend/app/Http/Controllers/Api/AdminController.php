<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Kelas;
use App\Models\Mahasiswa;
use App\Models\LoginSlide;
use App\Models\MataKuliah;
use App\Models\Prodi;
use App\Services\DosenService;
use App\Services\DosenImportService;
use App\Services\JadwalService;
use App\Services\KelasService;
use App\Services\MahasiswaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function __construct(
        private MahasiswaService $mahasiswaService,
        private DosenService     $dosenService,
        private DosenImportService $dosenImportService,
        private KelasService     $kelasService,
        private JadwalService    $jadwalService,
    ) {}

    /* ══════════════════════════════════════════════
     *  IMPORT
     * ══════════════════════════════════════════════ */

    public function importDosen(\App\Http\Requests\Admin\ImportDosenRequest $request): JsonResponse
    {
        $result = $this->dosenImportService->import($request->file('file'));

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'errors'  => $result['errors'] ?? []
            ], 422);
        }

        if (!empty($result['partial'])) {
            return response()->json($result, 207);
        }

        return response()->json([
            'message'  => $result['message'],
            'imported' => $result['total'] ?? $result['data_berhasil'],
        ]);
    }

    /* ══════════════════════════════════════════════
     *  MATA KULIAH
     * ══════════════════════════════════════════════ */

    public function mataKuliahIndex(Request $request): JsonResponse
    {
        $query = MataKuliah::query();
        
        if ($request->has('prodi_id')) {
            $query->where('prodi_id', $request->prodi_id);
        }
        
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        return response()->json($query->orderBy('nama')->get());
    }

    public function mataKuliahStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kode'      => 'required|string|unique:mata_kuliah,kode',
            'nama'      => 'required|string',
            'sks'       => 'required|integer|min:1|max:6',
            'semester'  => 'required|integer|min:1|max:14',
            'deskripsi' => 'nullable|string',
        ]);

        return response()->json(MataKuliah::create($data), 201);
    }

    public function mataKuliahUpdate(Request $request, MataKuliah $mataKuliah): JsonResponse
    {
        $data = $request->validate([
            'kode'      => 'sometimes|string|unique:mata_kuliah,kode,' . $mataKuliah->id,
            'nama'      => 'sometimes|string',
            'sks'       => 'sometimes|integer|min:1|max:6',
            'semester'  => 'sometimes|integer|min:1|max:14',
            'deskripsi' => 'nullable|string',
        ]);

        $mataKuliah->update($data);
        return response()->json($mataKuliah);
    }

    public function mataKuliahDestroy(MataKuliah $mataKuliah): JsonResponse
    {
        $mataKuliah->delete();
        return response()->json(['message' => 'Mata kuliah dihapus.']);
    }

    public function referensiOptions(): JsonResponse
    {
        return response()->json([
            'fakultas'     => Fakultas::select('id', 'kode', 'nama')->orderBy('kode')->get(),
            'tahun_ajaran' => ['2023/2024', '2024/2025', '2025/2026'],
            'semester'     => ['1', '2', '3', '4', '5', '6', '7', '8'],
        ]);
    }

    /* ══════════════════════════════════════════════
     *  KELAS
     * ══════════════════════════════════════════════ */

    public function kelasIndex(Request $request): JsonResponse
    {
        $query = Kelas::with(['mataKuliah', 'dosen.user', 'dosenPA.user', 'prodi.fakultas']);

        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->has('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function kelasStore(\App\Http\Requests\Admin\StoreKelasRequest $request): JsonResponse
    {
        $data = $request->validated();

        $kelas = $this->kelasService->create($data);

        return response()->json($kelas->load(['mataKuliah', 'dosen.user', 'dosenPA.user', 'prodi.fakultas']), 201);
    }

    public function kelasUpdate(\App\Http\Requests\Admin\UpdateKelasRequest $request, Kelas $kelas): JsonResponse
    {
        $data = $request->validated();

        $kelas = $this->kelasService->update($kelas, $data);

        return response()->json($kelas->load(['mataKuliah', 'dosen.user']));
    }

    public function kelasDestroy(Kelas $kelas): JsonResponse
    {
        $kelas->delete();
        return response()->json(['message' => 'Kelas dihapus.']);
    }

    public function kelasShow(Kelas $kelas): JsonResponse
    {
        return response()->json($kelas->load(['mataKuliah', 'dosen.user', 'mahasiswa.user', 'jadwal']));
    }

    /* ══════════════════════════════════════════════
     *  ASSIGN MAHASISWA KE KELAS
     * ══════════════════════════════════════════════ */

    public function assignMahasiswa(Request $request, Kelas $kelas): JsonResponse
    {
        $data = $request->validate([
            'mahasiswa_ids'   => 'required|array',
            'mahasiswa_ids.*' => 'exists:mahasiswa,id',
        ]);

        $this->kelasService->assignMahasiswa($kelas, $data['mahasiswa_ids']);

        return response()->json([
            'message'       => 'Mahasiswa berhasil di-assign.',
            'total_assigned' => $kelas->mahasiswa()->count(),
        ]);
    }

    public function removeMahasiswa(Request $request, Kelas $kelas): JsonResponse
    {
        $data = $request->validate([
            'mahasiswa_ids'   => 'required|array',
            'mahasiswa_ids.*' => 'exists:mahasiswa,id',
        ]);

        $this->kelasService->removeMahasiswa($kelas, $data['mahasiswa_ids']);

        return response()->json(['message' => 'Mahasiswa dihapus dari kelas.']);
    }

    /* ══════════════════════════════════════════════
     *  JADWAL
     * ══════════════════════════════════════════════ */

    public function jadwalIndex(Request $request): JsonResponse
    {
        $query = \App\Models\Jadwal::with('kelas.mataKuliah', 'kelas.dosen.user');

        if ($request->has('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        return response()->json($query->orderBy('hari')->orderBy('jam_mulai')->get());
    }

    public function jadwalStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kelas_id'    => 'required|exists:kelas,id',
            'hari'        => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'   => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'gedung'      => 'nullable|string',
            'ruangan'     => 'nullable|string',
        ]);

        $jadwal = $this->jadwalService->create($data);

        return response()->json($jadwal->load('kelas.mataKuliah'), 201);
    }

    public function jadwalUpdate(Request $request, \App\Models\Jadwal $jadwal): JsonResponse
    {
        $data = $request->validate([
            'kelas_id'    => 'sometimes|exists:kelas,id',
            'hari'        => 'sometimes|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'   => 'sometimes|date_format:H:i',
            'jam_selesai' => 'sometimes|date_format:H:i',
            'gedung'      => 'nullable|string',
            'ruangan'     => 'nullable|string',
        ]);

        $jadwal = $this->jadwalService->update($jadwal, $data);

        return response()->json($jadwal->load('kelas.mataKuliah'));
    }

    public function jadwalDestroy(\App\Models\Jadwal $jadwal): JsonResponse
    {
        $jadwal->delete();
        return response()->json(['message' => 'Jadwal dihapus.']);
    }

    /* ══════════════════════════════════════════════
     *  REFERENCE DATA
     * ══════════════════════════════════════════════ */

    public function fakultasList(): JsonResponse
    {
        return response()->json(Fakultas::with('prodi')->orderBy('kode')->get());
    }

    public function prodiList(Request $request): JsonResponse
    {
        $query = Prodi::with('fakultas');
        if ($request->has('fakultas_id')) {
            $query->where('fakultas_id', $request->fakultas_id);
        }
        return response()->json($query->orderBy('kode')->get());
    }

    public function mahasiswaList(Request $request): JsonResponse
    {
        $query = Mahasiswa::with(['user', 'prodi.fakultas']);

        if ($request->has('prodi_id')) {
            $query->where('prodi_id', $request->prodi_id);
        }
        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nim', 'LIKE', "%{$s}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'LIKE', "%{$s}%"));
            });
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function dosenList(Request $request): JsonResponse
    {
        $query = Dosen::with('user');

        \Illuminate\Support\Facades\Log::info("dosenList called with prodi_id: " . $request->get('prodi_id') . " Total Dosen in DB: " . Dosen::count() . " Total with this prodi: " . (clone $query)->where('prodi_id', $request->prodi_id)->count());

        if ($request->has('prodi_id') && $request->prodi_id !== '') {
            $query->where('prodi_id', $request->prodi_id);
        }

        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id_kerja', 'LIKE', "%{$s}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'LIKE', "%{$s}%"));
            });
        }
        $perPage = $request->get('per_page', 20);
        return response()->json($query->orderByDesc('id')->paginate($perPage));
    }

    /* ══════════════════════════════════════════════
     *  DASHBOARD STATS
     * ══════════════════════════════════════════════ */

    public function dashboard(): JsonResponse
    {
        return response()->json([
            'total_mahasiswa' => Mahasiswa::count(),
            'total_dosen'     => Dosen::count(),
            'total_kelas'     => Kelas::count(),
            'total_matkul'    => MataKuliah::count(),
            'total_fakultas'  => Fakultas::count(),
            'total_prodi'     => Prodi::count(),
        ]);
    }

    /* ══════════════════════════════════════════════
     *  ASSIGNMENT DOSEN (PENGAJAR & PA)
     * ══════════════════════════════════════════════ */

    public function assignPengajar(\App\Http\Requests\Admin\AssignPengajarRequest $request, \App\Services\AssignmentService $service): JsonResponse
    {
        $data = $request->validated();
        $result = $service->assignPengajar($data['dosen_id'], $data['mata_kuliah_id'], $data['kelas_ids']);
        
        $status = $result['success'] ? 200 : 422;
        return response()->json($result, $status);
    }

    public function removePengajar($id, \App\Services\AssignmentService $service): JsonResponse
    {
        $success = $service->removePengajar($id);
        return response()->json(['success' => $success, 'message' => $success ? 'Berhasil menghapus.' : 'Gagal menghapus.']);
    }

    public function assignPA(\App\Http\Requests\Admin\AssignPARequest $request, \App\Services\AssignmentService $service): JsonResponse
    {
        $data = $request->validated();
        $result = $service->assignPA($data['dosen_id'], $data['kelas_ids']);

        $status = $result['success'] ? 200 : 422;
        return response()->json($result, $status);
    }

    public function removePA($id, \App\Services\AssignmentService $service): JsonResponse
    {
        $success = $service->removePA($id);
        return response()->json(['success' => $success, 'message' => $success ? 'Berhasil menghapus.' : 'Gagal menghapus.']);
    }
}

