<?php

namespace App\Services;

use App\Models\Absensi;
use App\Models\Kelas;
use Illuminate\Validation\ValidationException;

class AbsensiService
{
    /**
     * Submit absensi untuk satu pertemuan.
     * $records = [ ['mahasiswa_id' => 1, 'status' => 'hadir'], ... ]
     */
    public function submitPertemuan(int $kelasId, int $pertemuan, array $records, string $tanggal): array
    {
        $this->validatePertemuan($pertemuan);

        $created = 0;
        $skipped = 0;

        foreach ($records as $rec) {
            $exists = Absensi::where('kelas_id', $kelasId)
                ->where('mahasiswa_id', $rec['mahasiswa_id'])
                ->where('pertemuan', $pertemuan)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            Absensi::create([
                'kelas_id'     => $kelasId,
                'mahasiswa_id' => $rec['mahasiswa_id'],
                'pertemuan'    => $pertemuan,
                'status'       => $rec['status'],
                'tanggal'      => $tanggal,
            ]);
            $created++;
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    /**
     * Get absensi summary for a mahasiswa in a kelas.
     */
    public function getSummary(int $kelasId, int $mahasiswaId): array
    {
        $records = Absensi::where('kelas_id', $kelasId)
            ->where('mahasiswa_id', $mahasiswaId)
            ->get();

        $total = $records->count();
        $hadir = $records->where('status', 'hadir')->count();
        $izin  = $records->where('status', 'izin')->count();
        $alpha = $records->where('status', 'alpha')->count();

        return [
            'total'      => $total,
            'hadir'      => $hadir,
            'izin'       => $izin,
            'alpha'      => $alpha,
            'persentase' => $total > 0 ? round(($hadir / 16) * 100, 1) : 0,
        ];
    }

    /**
     * Get all absensi for a mahasiswa across all kelas.
     */
    public function getMahasiswaAbsensi(int $mahasiswaId): array
    {
        $kelas = \App\Models\Kelas::whereHas('mahasiswa', fn($q) => $q->where('mahasiswa.id', $mahasiswaId))
            ->with('mataKuliah')
            ->get();

        $result = [];
        foreach ($kelas as $k) {
            $result[] = [
                'kelas_id'   => $k->id,
                'mata_kuliah' => $k->mataKuliah->nama,
                'summary'    => $this->getSummary($k->id, $mahasiswaId),
            ];
        }

        return $result;
    }

    private function validatePertemuan(int $pertemuan): void
    {
        if ($pertemuan < 1 || $pertemuan > 16) {
            throw ValidationException::withMessages([
                'pertemuan' => 'Pertemuan harus antara 1 sampai 16.',
            ]);
        }
    }
}
