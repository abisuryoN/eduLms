<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\Prodi;

class NimGeneratorService
{
    /**
     * Generate NIM: [tahun_masuk][kode_fakultas][kode_prodi][nomor_urut_4digit]
     * Contoh: 202340110001
     */
    public function generate(int $tahunMasuk, int $prodiId): string
    {
        $prodi = Prodi::with('fakultas')->findOrFail($prodiId);

        $kodeFakultas = str_pad($prodi->fakultas->kode, 2, '0', STR_PAD_LEFT);
        $kodeProdi    = str_pad($prodi->kode, 2, '0', STR_PAD_LEFT);
        $prefix       = $tahunMasuk . $kodeFakultas . $kodeProdi;

        $lastNim = Mahasiswa::where('nim', 'LIKE', $prefix . '%')
            ->orderByDesc('nim')
            ->value('nim');

        if ($lastNim) {
            $lastUrut = (int) substr($lastNim, -4);
            $nextUrut = $lastUrut + 1;
        } else {
            $nextUrut = 1;
        }

        return $prefix . str_pad($nextUrut, 4, '0', STR_PAD_LEFT);
    }
}
