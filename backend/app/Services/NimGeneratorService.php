<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\Prodi;

class NimGeneratorService
{
    private array $counterCache = [];
    private array $prodiCache = [];

    /**
     * Generate NIM: [Tahun Masuk][Kode Prodi][Nomor Urut 3 digit]
     * Contoh: 202411001
     */
    public function generate(int $tahunMasuk, int $prodiId): string
    {
        // 1. Dapatkan Kode Prodi (Cache di memori agar tidak query berulang)
        if (!isset($this->prodiCache[$prodiId])) {
            $this->prodiCache[$prodiId] = Prodi::findOrFail($prodiId);
        }
        $prodi = $this->prodiCache[$prodiId];
        
        // Asumsi format kode prodi misalnya '11', '02', string normal, kita gunakan langsung atau pad jika perlu.
        // User minta [Tahun Masuk][Kode Prodi]. Kita pad kode_prodi mjd 2 digit sbg contoh.
        $kodeProdi = str_pad($prodi->kode, 2, '0', STR_PAD_LEFT);
        $prefix    = $tahunMasuk . $kodeProdi;

        $cacheKey = $tahunMasuk . '_' . $prodiId;

        // 2. Jika counter belum ada di memori, query 1x ke DB
        if (!isset($this->counterCache[$cacheKey])) {
            $lastNim = Mahasiswa::where('nim', 'LIKE', $prefix . '%')
                ->orderByDesc('nim')
                ->value('nim');

            if ($lastNim) {
                // Ekstrak 3 digit terakhir
                $this->counterCache[$cacheKey] = (int) substr($lastNim, -3);
            } else {
                $this->counterCache[$cacheKey] = 0;
            }
        }

        // 3. Increment counter lokal
        $this->counterCache[$cacheKey]++;

        // 4. Return NIM terformat dengan padding 3 digit
        return $prefix . str_pad($this->counterCache[$cacheKey], 3, '0', STR_PAD_LEFT);
    }
}
