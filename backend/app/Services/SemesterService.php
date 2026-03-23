<?php

namespace App\Services;

use Carbon\Carbon;

class SemesterService
{
    /**
     * Hitung semester aktif berdasarkan tanggal masuk.
     * 6 bulan = 1 semester.
     */
    public function hitungSemester(\DateTimeInterface|string $tanggalMasuk): int
    {
        $masuk  = Carbon::parse($tanggalMasuk);
        $months = $masuk->diffInMonths(Carbon::now());

        return (int) max(1, ceil(($months + 1) / 6));
    }

    /**
     * Dapatkan tahun ajaran saat ini, misal "2025/2026".
     */
    public function tahunAjaranSekarang(): string
    {
        $now   = Carbon::now();
        $year  = $now->year;
        $month = $now->month;

        // Semester ganjil: Agustus - Januari, genap: Februari - Juli
        if ($month >= 8) {
            return $year . '/' . ($year + 1);
        }

        return ($year - 1) . '/' . $year;
    }
}
