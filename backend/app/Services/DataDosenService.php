<?php

namespace App\Services;

use App\Models\Dosen;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class DataDosenService
{
    /**
     * Get paginated & filtered dosen list.
     * Filters: fakultas_id, prodi_id, search (nama / NIDN / id_kerja)
     * Always eager loads: user (select), prodi (select), prodi.fakultas (select)
     */
    public function getPaginated(Request $request): LengthAwarePaginator
    {
        $query = Dosen::query()
            ->select(['id', 'user_id', 'prodi_id', 'id_kerja', 'keahlian'])
            ->with([
                'user:id,name,email,avatar',
                'prodi:id,fakultas_id,kode,nama',
                'prodi.fakultas:id,kode,nama',
                'teachingAssignments.mataKuliah:id,kode,nama,sks',
                'teachingAssignments.kelas:id,nama_kelas,semester',
                'pembimbingAkademik.kelas:id,nama_kelas,semester',
            ]);

        // Filter by fakultas (through prodi)
        $query->when($request->filled('fakultas_id'), function ($q) use ($request) {
            $q->whereHas('prodi', fn($p) => $p->where('fakultas_id', $request->fakultas_id));
        });

        // Filter by prodi
        $query->when($request->filled('prodi_id'), function ($q) use ($request) {
            $q->where('prodi_id', $request->prodi_id);
        });

        // Search by name or NIDN (id_kerja)
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->search;
            $q->where(function ($sub) use ($search) {
                $sub->where('id_kerja', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'LIKE', "%{$search}%"));
            });
        });

        $perPage = in_array((int) $request->get('per_page'), [10, 15, 50]) 
            ? (int) $request->get('per_page') 
            : 10;

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }
}
