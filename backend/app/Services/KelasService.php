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
        $this->validateDosenCapacity($data['dosen_id'], $data['semester'], $data['tahun_ajaran']);

        return Kelas::create($data);
    }

    /**
     * Update kelas.
     */
    public function update(Kelas $kelas, array $data): Kelas
    {
        if (isset($data['dosen_id']) || isset($data['semester']) || isset($data['tahun_ajaran'])) {
            $dosenId     = $data['dosen_id'] ?? $kelas->dosen_id;
            $semester    = $data['semester'] ?? $kelas->semester;
            $tahunAjaran = $data['tahun_ajaran'] ?? $kelas->tahun_ajaran;
            $this->validateDosenCapacity($dosenId, $semester, $tahunAjaran, $kelas->id);
        }

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

    /**
     * Validasi: maksimal 8 kelas per dosen per semester.
     */
    private function validateDosenCapacity(int $dosenId, string $semester, string $tahunAjaran, ?int $excludeKelasId = null): void
    {
        $query = Kelas::where('dosen_id', $dosenId)
            ->where('semester', $semester)
            ->where('tahun_ajaran', $tahunAjaran);

        if ($excludeKelasId) {
            $query->where('id', '!=', $excludeKelasId);
        }

        if ($query->count() >= 8) {
            throw ValidationException::withMessages([
                'dosen_id' => 'Dosen sudah memiliki maksimal 8 kelas pada semester ini.',
            ]);
        }
    }
}
