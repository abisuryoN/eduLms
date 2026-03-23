<?php

namespace App\Services;

use App\Models\Jadwal;
use Illuminate\Validation\ValidationException;

class JadwalService
{
    /**
     * Create jadwal with clash validation.
     */
    public function create(array $data): Jadwal
    {
        $this->validateNoClash($data);

        return Jadwal::create($data);
    }

    /**
     * Update jadwal with clash validation.
     */
    public function update(Jadwal $jadwal, array $data): Jadwal
    {
        $this->validateNoClash($data, $jadwal->id);

        $jadwal->update($data);
        return $jadwal->fresh();
    }

    /**
     * Validate: no schedule clash for the same dosen on same day/time.
     */
    private function validateNoClash(array $data, ?int $excludeId = null): void
    {
        $kelas = \App\Models\Kelas::findOrFail($data['kelas_id']);
        $dosenId = $kelas->dosen_id;

        $query = Jadwal::whereHas('kelas', fn($q) => $q->where('dosen_id', $dosenId))
            ->where('hari', $data['hari'])
            ->where(function ($q) use ($data) {
                $q->where(function ($q2) use ($data) {
                    $q2->where('jam_mulai', '<', $data['jam_selesai'])
                       ->where('jam_selesai', '>', $data['jam_mulai']);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'jadwal' => 'Jadwal bentrok dengan jadwal dosen yang sudah ada.',
            ]);
        }
    }
}
