<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Kelas;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\Prodi;
use App\Services\DosenService;
use App\Services\JadwalService;
use App\Services\KelasService;
use App\Services\MahasiswaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private MahasiswaService $mahasiswaService,
        private DosenService     $dosenService,
        private KelasService     $kelasService,
        private JadwalService    $jadwalService,
    ) {}

    /* ══════════════════════════════════════════════
     *  IMPORT
     * ══════════════════════════════════════════════ */

    public function importMahasiswa(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);

        $result = $this->mahasiswaService->import($request->file('file'));

        return response()->json([
            'message'  => "Berhasil import {$result['imported']} mahasiswa.",
            'imported' => $result['imported'],
            'errors'   => $result['errors'],
        ]);
    }

    public function importDosen(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);

        $result = $this->dosenService->import($request->file('file'));

        return response()->json([
            'message'  => "Berhasil import {$result['imported']} dosen.",
            'imported' => $result['imported'],
            'errors'   => $result['errors'],
        ]);
    }

    /* ══════════════════════════════════════════════
     *  MATA KULIAH
     * ══════════════════════════════════════════════ */

    public function mataKuliahIndex(): JsonResponse
    {
        return response()->json(MataKuliah::orderBy('nama')->get());
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

    /* ══════════════════════════════════════════════
     *  KELAS
     * ══════════════════════════════════════════════ */

    public function kelasIndex(Request $request): JsonResponse
    {
        $query = Kelas::with(['mataKuliah', 'dosen.user']);

        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->has('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function kelasStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'dosen_id'       => 'required|exists:dosen,id',
            'nama_kelas'     => 'required|string|max:10',
            'semester'       => 'required|string',
            'tahun_ajaran'   => 'required|string',
        ]);

        $kelas = $this->kelasService->create($data);

        return response()->json($kelas->load(['mataKuliah', 'dosen.user']), 201);
    }

    public function kelasUpdate(Request $request, Kelas $kelas): JsonResponse
    {
        $data = $request->validate([
            'mata_kuliah_id' => 'sometimes|exists:mata_kuliah,id',
            'dosen_id'       => 'sometimes|exists:dosen,id',
            'nama_kelas'     => 'sometimes|string|max:10',
            'semester'       => 'sometimes|string',
            'tahun_ajaran'   => 'sometimes|string',
        ]);

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

        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id_kerja', 'LIKE', "%{$s}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'LIKE', "%{$s}%"));
            });
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
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
}
