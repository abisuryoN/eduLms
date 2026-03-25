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
use App\Models\Jadwal;
use App\Http\Requests\Admin\StoreKelasRequest;
use App\Http\Requests\Admin\UpdateKelasRequest;
use App\Http\Requests\Admin\StoreJadwalRequest;
use App\Http\Requests\Admin\UpdateJadwalRequest;
use App\Services\DataDosenService;
use App\Services\DataMahasiswaService;
use App\Services\DosenService;
use App\Services\DosenImportService;
use App\Services\JadwalService;
use App\Services\KelasService;
use App\Services\MahasiswaService;
use App\Services\AssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AdminController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private DataMahasiswaService   $dataMahasiswaService,
        private KelasService           $kelasService,
        private JadwalService          $jadwalService,
        private MahasiswaService       $mahasiswaService,
        private DosenService           $dosenService,
        private DosenImportService     $dosenImportService,
        private DataDosenService       $dataDosenService,
    ) {}

    /* ══════════════════════════════════════════════
     *  IMPORT
     * ══════════════════════════════════════════════ */

    public function importDosen(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        $result = $this->dosenImportService->import($request->file('file'));

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors'  => $result['errors'] ?? []
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data'    => [
                'imported' => $result['total'] ?? $result['data_berhasil'],
            ]
        ], $result['partial'] ? 207 : 200);
    }

    /* ══════════════════════════════════════════════
     *  REFERENCE DATA
     * ══════════════════════════════════════════════ */

    public function referensiOptions(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'fakultas'     => Fakultas::select('id', 'kode', 'nama')->orderBy('kode')->get(),
                'tahun_ajaran' => ['2023/2024', '2024/2025', '2025/2026'],
                'semester'     => ['1', '2', '3', '4', '5', '6', '7', '8'],
            ]
        ]);
    }

    public function fakultasList(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => Fakultas::with('prodi')->orderBy('kode')->get()
        ]);
    }

    public function prodiList(Request $request): JsonResponse
    {
        $query = Prodi::with('fakultas');
        if ($request->has('fakultas_id')) {
            $query->where('fakultas_id', $request->fakultas_id);
        }
        return response()->json([
            'success' => true,
            'data'    => $query->orderBy('kode')->get()
        ]);
    }

    public function mahasiswaList(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->dataMahasiswaService->getPaginated($request)
        ]);
    }

    public function dosenList(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->dataDosenService->getPaginated($request)
        ]);
    }

    public function semesterList(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => Kelas::select('semester')->distinct()->orderBy('semester')->pluck('semester')
        ]);
    }

    /* ══════════════════════════════════════════════
     *  KELAS
     * ══════════════════════════════════════════════ */

    public function kelasIndex(Request $request): JsonResponse
    {
        \Log::info('FILTER:', $request->all());

        $query = Kelas::with([
            'prodi.fakultas',
            'teachingAssignments.mataKuliah',
            'teachingAssignments.dosen.user',
            'pembimbingAkademik.dosen.user'
        ]);

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }
        if ($request->filled('fakultas_id')) {
            $query->where('fakultas_id', $request->fakultas_id);
        }
        if ($request->filled('prodi_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('prodi_id', $request->prodi_id)
                  ->orWhereNull('prodi_id');
            });
        }

        if ($request->filled('kategori_kelas') || $request->filled('kategori')) {
            $cat = $request->kategori_kelas ?: $request->kategori;
            // Use LIKE and LOWER for maximum flexibility
            $query->whereRaw('LOWER(kategori_kelas) LIKE ?', ['%' . strtolower($cat) . '%']);
        }

        \Log::info('RESULT:', $query->get()->toArray());

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_kelas', 'LIKE', "%{$search}%")
                  ->orWhereHas('prodi', fn($p) => $p->where('nama', 'LIKE', "%{$search}%"))
                  ->orWhereHas('teachingAssignments.mataKuliah', function ($mq) use ($search) {
                      $mq->where('nama', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Support for non-paginated results (e.g., for dropdowns)
        if ($request->boolean('all')) {
            return response()->json([
                'success' => true,
                'data'    => $query->orderByDesc('id')->get()
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $query->orderByDesc('id')->paginate($request->get('per_page', 20))
        ]);
    }

    public function kelasStore(StoreKelasRequest $request): JsonResponse
    {
        $kelas = $this->kelasService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kelas berhasil dibuat.',
            'data'    => $kelas->load('prodi.fakultas', 'dosen.user', 'mataKuliah'),
        ], 201);
    }

    public function kelasShow(Kelas $kelas): JsonResponse
    {
        // Load relations with standardized names (camelCase in PHP, will be snake_case in JSON response)
        $kelas->load([
            'prodi.fakultas',
            'teachingAssignments.mataKuliah',
            'teachingAssignments.dosen.user:id,name',
            'pembimbingAkademik.dosen.user:id,name',
            'mahasiswa.user:id,name',
            'jadwal',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $kelas
        ]);
    }

    public function kelasUpdate(UpdateKelasRequest $request, Kelas $kelas): JsonResponse
    {
        $kelas = $this->kelasService->update($kelas, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kelas berhasil diupdate.',
            'data'    => $kelas->load('prodi.fakultas', 'dosen.user', 'mataKuliah'),
        ]);
    }

    public function kelasDestroy(Kelas $kelas): JsonResponse
    {
        $kelas->delete();
        return response()->json([
            'success' => true,
            'message' => 'Kelas dihapus.',
        ]);
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
            'success' => true,
            'message' => 'Mahasiswa berhasil di-assign.',
            'data'    => [
                'total_assigned' => $kelas->mahasiswa()->count(),
            ]
        ]);
    }

    public function removeMahasiswa(Request $request, Kelas $kelas): JsonResponse
    {
        $data = $request->validate([
            'mahasiswa_ids'   => 'required|array',
            'mahasiswa_ids.*' => 'exists:mahasiswa,id',
        ]);

        $this->kelasService->removeMahasiswa($kelas, $data['mahasiswa_ids']);

        return response()->json([
            'success' => true,
            'message' => 'Mahasiswa dihapus dari kelas.'
        ]);
    }

    /* ══════════════════════════════════════════════
     *  JADWAL
     * ══════════════════════════════════════════════ */

    public function jadwalIndex(Request $request): JsonResponse
    {
        $query = Jadwal::with([
            'kelas.prodi.fakultas',
            'kelas.teachingAssignments.mataKuliah',
            'kelas.teachingAssignments.dosen.user',
            'kelas.pembimbingAkademik.dosen.user'
        ]);

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        $query->when($request->filled('fakultas_id'), fn($q) =>
            $q->whereHas('kelas', fn($k) => $k->where('fakultas_id', $request->fakultas_id))
        );
        $query->when($request->filled('prodi_id'), fn($q) =>
            $q->whereHas('kelas', fn($k) => $k->where('prodi_id', $request->prodi_id))
        );
        $query->when($request->filled('semester'), fn($q) =>
            $q->whereHas('kelas', fn($k) => $k->where('semester', $request->semester))
        );
        $query->when($request->filled('kategori_kelas'), fn($q) =>
            $q->whereHas('kelas', fn($k) => $k->where('kategori_kelas', $request->kategori_kelas))
        );
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->search;
            $q->where(function ($sub) use ($search) {
                $sub->where('hari', 'LIKE', "%{$search}%")
                    ->orWhereHas('kelas', fn($k) => $k->where('nama_kelas', 'LIKE', "%{$search}%"));
            });
        });

        return response()->json([
            'success' => true,
            'data'    => $query->orderBy('hari')->orderBy('jam_mulai')->get()
        ]);
    }

    public function jadwalStore(StoreJadwalRequest $request): JsonResponse
    {
        $jadwal = $this->jadwalService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dibuat.',
            'data'    => $jadwal->load('kelas.mataKuliah'),
        ], 201);
    }

    public function jadwalUpdate(UpdateJadwalRequest $request, Jadwal $jadwal): JsonResponse
    {
        $jadwal = $this->jadwalService->update($jadwal, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diupdate.',
            'data'    => $jadwal->load('kelas.mataKuliah'),
        ]);
    }

    public function jadwalDestroy(Jadwal $jadwal): JsonResponse
    {
        $jadwal->delete();
        return response()->json([
            'success' => true,
            'message' => 'Jadwal dihapus.',
        ]);
    }

    /* ══════════════════════════════════════════════
     *  DASHBOARD STATS
     * ══════════════════════════════════════════════ */

    public function dashboard(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'total_mahasiswa' => Mahasiswa::count(),
                'total_dosen'     => Dosen::count(),
                'total_kelas'     => Kelas::count(),
                'total_matkul'    => MataKuliah::count(),
                'total_fakultas'  => Fakultas::count(),
                'total_prodi'     => Prodi::count(),
            ]
        ]);
    }

    /* ══════════════════════════════════════════════
     *  ASSIGNMENT DOSEN (PENGAJAR & PA)
     * ══════════════════════════════════════════════ */

    public function assignPengajar(Request $request, AssignmentService $service): JsonResponse
    {
        $data = $request->validate([
            'dosen_id'       => 'required|exists:dosen,id',
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'kelas_ids'      => 'required|array',
            'kelas_ids.*'    => 'exists:kelas,id',
        ]);

        $result = $service->assignPengajar($data['dosen_id'], $data['mata_kuliah_id'], $data['kelas_ids']);
        
        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function removePengajar($id, AssignmentService $service): JsonResponse
    {
        $success = $service->removePengajar($id);
        return response()->json([
            'success' => $success,
            'message' => $success ? 'Berhasil menghapus pengajar.' : 'Gagal menghapus pengajar.'
        ]);
    }

    public function assignPA(Request $request, AssignmentService $service): JsonResponse
    {
        $data = $request->validate([
            'dosen_id'  => 'required|exists:dosen,id',
            'kelas_ids' => 'required|array',
            'kelas_ids.*' => 'exists:kelas,id',
        ]);

        $result = $service->assignPA($data['dosen_id'], $data['kelas_ids']);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function removePA($id, AssignmentService $service): JsonResponse
    {
        $success = $service->removePA($id);
        return response()->json([
            'success' => $success, 
            'message' => $success ? 'Berhasil menghapus PA.' : 'Gagal menghapus PA.'
        ]);
    }
}
