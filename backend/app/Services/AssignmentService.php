<?php

namespace App\Services;

use App\Models\Kelas;
use App\Models\TeachingAssignment;
use App\Models\PembimbingAkademik;
use Illuminate\Support\Facades\DB;
use Exception;

class AssignmentService
{
    /**
     * Assign satu dosen ke beberapa kelas untuk mata kuliah tertentu sekaligus.
     */
    public function assignPengajar(int $dosenId, int $mataKuliahId, array $kelasIds): array
    {
        // 1. Validasi: pastikan kelas tersebut sesuai dengan prodi dosen (opsional) atau matkul.
        // Di sini kita cek bahwa kelas tidak boleh memiliki 2 dosen di 1 matkul yang sama
        DB::beginTransaction();
        try {
            $inserted = 0;
            $skipped = 0;

            foreach ($kelasIds as $kId) {
                // Cek apakah di kelas ini untuk matkul tsb sudah ada pengajar lain
                $existing = TeachingAssignment::where('kelas_id', $kId)
                                              ->where('mata_kuliah_id', $mataKuliahId)
                                              ->first();
                if ($existing) {
                    if ($existing->dosen_id === $dosenId) {
                        // Sudah assign ke orang yang sama, lewati
                        $skipped++;
                    } else {
                        // Di-assign ke dosen lain, throw error (conflict)
                        throw new Exception("Kelas ID {$kId} sudah memiliki Dosen Pengajar untuk Matkul ID {$mataKuliahId}.");
                    }
                } else {
                    TeachingAssignment::create([
                        'dosen_id' => $dosenId,
                        'kelas_id' => $kId,
                        'mata_kuliah_id' => $mataKuliahId,
                    ]);
                    $inserted++;
                }
            }

            DB::commit();
            return [
                'success' => true,
                'message' => "Berhasil assign {$inserted} kelas. Dilewati: {$skipped}.",
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Gagal assign pengajar: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Menghapus assign pengajar.
     */
    public function removePengajar(int $assignmentId): bool
    {
        $assignment = TeachingAssignment::find($assignmentId);
        if ($assignment) {
            return $assignment->delete();
        }
        return false;
    }

    /**
     * Assign Dosen PA ke beberapa kelas.
     * Aturan: 1 kelas cuma boleh punya 1 PA.
     */
    public function assignPA(int $dosenId, array $kelasIds): array
    {
        DB::beginTransaction();
        try {
            $inserted = 0;
            $skipped = 0;

            foreach ($kelasIds as $kId) {
                $existing = PembimbingAkademik::where('kelas_id', $kId)->first();
                
                if ($existing) {
                    if ($existing->dosen_id === $dosenId) {
                        // Sama
                        $skipped++;
                    } else {
                        // Conflict
                        throw new Exception("Kelas ID {$kId} sudah memiliki Dosen Pembimbing Akademik yang berbeda.");
                    }
                } else {
                    PembimbingAkademik::create([
                        'dosen_id' => $dosenId,
                        'kelas_id' => $kId,
                    ]);
                    $inserted++;
                }
            }

            DB::commit();
            return [
                'success' => true,
                'message' => "Berhasil assign PA ke {$inserted} kelas. Dilewati: {$skipped}."
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Gagal assign PA: ' . $e->getMessage()
            ];
        }
    }

    public function removePA(int $paId): bool
    {
        $pa = PembimbingAkademik::find($paId);
        if ($pa) {
            return $pa->delete();
        }
        return false;
    }
}
