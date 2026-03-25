<?php

namespace App\Services;

use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class DataMahasiswaService
{
    /**
     * Get paginated & filtered mahasiswa list.
     * Filters: fakultas_id, prodi_id, kelas_id, search (nama / NIM)
     * Always eager loads: user, prodi.fakultas, kelas
     * Appends: semester (computed accessor)
     */
    public function getPaginated(Request $request): LengthAwarePaginator
    {
        $query = Mahasiswa::query()
            ->select(['id', 'user_id', 'prodi_id', 'nim', 'tanggal_masuk'])
            ->with([
                'user:id,name,email,avatar',
                'prodi:id,fakultas_id,kode,nama',
                'prodi.fakultas:id,kode,nama',
                'kelas:kelas.id,kelas.nama_kelas,kelas.semester',
            ]);

        // Filter by fakultas (through prodi)
        $query->when($request->filled('fakultas_id'), function ($q) use ($request) {
            $q->whereHas('prodi', fn($p) => $p->where('fakultas_id', $request->fakultas_id));
        });

        // Filter by prodi
        $query->when($request->filled('prodi_id'), function ($q) use ($request) {
            $q->where('prodi_id', $request->prodi_id);
        });

        // Filter by kelas (via pivot kelas_mahasiswa)
        $query->when($request->filled('kelas_id'), function ($q) use ($request) {
            $q->whereHas('kelas', fn($k) => $k->where('kelas.id', $request->kelas_id));
        });

        // Filter by semester (via kelas pivot)
        $query->when($request->filled('semester'), function ($q) use ($request) {
            $q->whereHas('kelas', fn($k) => $k->where('kelas.semester', $request->semester));
        });

        // Search by name or NIM
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->search;
            $q->where(function ($sub) use ($search) {
                $sub->where('nim', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'LIKE', "%{$search}%"));
            });
        });

        $perPage = in_array((int) $request->get('per_page'), [10, 25, 50]) 
            ? (int) $request->get('per_page') 
            : 10;

        return $query->orderBy('id', 'desc')->paginate($perPage)->through(function ($mhs) {
            $mhs->append('semester');
            return $mhs;
        });
    }
}
