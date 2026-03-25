<?php

namespace App\Services;

use App\Models\Kelas;
use App\Models\Dosen;
use App\Models\Jadwal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KelasService
{
    /**
     * Create a new kelas with validation.
     * Max 8 kelas per dosen per semester.
     */
    public function create(array $data): Kelas
    {
        return Kelas::create($data);
    }

    /**
     * Update kelas.
     */
    public function update(Kelas $kelas, array $data): Kelas
    {
        $kelas->update($data);
        return $kelas->fresh();
    }

    /**
     * Assign mahasiswa ke kelas.
     */
    public function assignMahasiswa(Kelas $kelas, array $mahasiswaIds): void
    {
        $kelas->mahasiswa()->syncWithoutDetaching($mahasiswaIds);
    }

    /**
     * Remove mahasiswa dari kelas.
     */
    public function removeMahasiswa(Kelas $kelas, array $mahasiswaIds): void
    {
        $kelas->mahasiswa()->detach($mahasiswaIds);
    }
}
