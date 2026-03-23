<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\MahasiswaImport;
use Exception;

class MahasiswaImportService
{
    public function __construct(
        private NimGeneratorService $nimGenerator
    ) {}

    /**
     * Preview data dari file Excel tanpa menyimpan ke database.
     */
    public function preview(UploadedFile $file): array
    {
        try {
            $import = new MahasiswaImport($this->nimGenerator);
            Excel::import($import, $file);

            $rows = $import->getParsedRows();
            $previews = [];
            $totalValid = 0;
            $totalInvalid = 0;

            foreach ($rows as $row) {
                $errors = $this->validateRow($row['data'], $row['row_number']);

                $nimPreview = null;
                if (empty($errors) && !empty($row['data']['kode_prodi'])) {
                    $prodi = Prodi::where('kode', $row['data']['kode_prodi'])->first();
                    if ($prodi && !empty($row['data']['tanggal_masuk'])) {
                        try {
                            $tahun = Carbon::parse($row['data']['tanggal_masuk'])->year;
                            $nimPreview = $this->nimGenerator->generate($tahun, $prodi->id) . ' (preview)';
                        } catch (Exception $e) {
                            // NIM preview gagal, tidak masalah
                        }
                    }
                }

                $isValid = empty($errors);
                $isValid ? $totalValid++ : $totalInvalid++;

                $previews[] = [
                    'row'         => $row['row_number'],
                    'nama'        => $row['data']['nama'] ?? '',
                    'email'       => $row['data']['email'] ?? '',
                    'kode_prodi'  => $row['data']['kode_prodi'] ?? '',
                    'tanggal_lahir' => $row['data']['tanggal_lahir'] ?? '',
                    'tanggal_masuk' => $row['data']['tanggal_masuk'] ?? '',
                    'nim_preview' => $nimPreview,
                    'valid'       => $isValid,
                    'errors'      => $errors,
                ];
            }

            return [
                'success'       => true,
                'data'          => $previews,
                'total_valid'   => $totalValid,
                'total_invalid' => $totalInvalid,
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal memproses file: ' . $e->getMessage()];
        }
    }

    /**
     * Import data mahasiswa ke database setelah user konfirmasi.
     */
    public function import(UploadedFile $file): array
    {
        try {
            $import = new MahasiswaImport($this->nimGenerator);
            Excel::import($import, $file);

            $rows = $import->getParsedRows();

            // Validate semua baris dulu
            $allErrors = [];
            foreach ($rows as $row) {
                $errors = $this->validateRow($row['data'], $row['row_number']);
                if (!empty($errors)) {
                    $allErrors = array_merge($allErrors, $errors);
                }
            }

            if (!empty($allErrors)) {
                return [
                    'success' => false,
                    'message' => 'Ada data yang tidak valid. Perbaiki terlebih dahulu.',
                    'errors'  => $allErrors,
                ];
            }

            // Semua valid → import dengan transaction + chunk
            $importedCount = 0;
            $chunks = array_chunk($rows, 50);

            foreach ($chunks as $chunk) {
                DB::transaction(function () use ($chunk, &$importedCount) {
                    foreach ($chunk as $row) {
                        $this->insertRow($row['data']);
                        $importedCount++;
                    }
                });
            }

            return [
                'success' => true,
                'message' => "Import berhasil. {$importedCount} mahasiswa ditambahkan.",
                'total'   => $importedCount,
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()];
        }
    }

    /**
     * Validasi satu baris data.
     */
    private function validateRow(array $data, int $rowNumber): array
    {
        $errors = [];
        $prefix = "Baris {$rowNumber}";

        // nama: wajib
        if (empty($data['nama'])) {
            $errors[] = "{$prefix}: nama wajib diisi.";
        }

        // tanggal_lahir: wajib, format YYYY-MM-DD
        if (empty($data['tanggal_lahir'])) {
            $errors[] = "{$prefix}: tanggal_lahir wajib diisi.";
        } else {
            try {
                Carbon::createFromFormat('Y-m-d', $data['tanggal_lahir']);
            } catch (Exception $e) {
                $errors[] = "{$prefix}: tanggal_lahir harus format YYYY-MM-DD.";
            }
        }

        // tanggal_masuk: wajib, format YYYY-MM-DD
        if (empty($data['tanggal_masuk'])) {
            $errors[] = "{$prefix}: tanggal_masuk wajib diisi.";
        } else {
            try {
                Carbon::createFromFormat('Y-m-d', $data['tanggal_masuk']);
            } catch (Exception $e) {
                $errors[] = "{$prefix}: tanggal_masuk harus format YYYY-MM-DD.";
            }
        }

        // email: optional, tapi jika ada harus valid
        if (!empty($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "{$prefix}: email tidak valid.";
            } elseif (User::where('email', $data['email'])->exists()) {
                $errors[] = "{$prefix}: email '{$data['email']}' sudah terdaftar.";
            }
        }

        // kode_prodi: wajib, harus ada di DB
        if (empty($data['kode_prodi'])) {
            $errors[] = "{$prefix}: kode_prodi wajib diisi.";
        } else {
            if (!Prodi::where('kode', $data['kode_prodi'])->exists()) {
                $errors[] = "{$prefix}: kode_prodi '{$data['kode_prodi']}' tidak ditemukan.";
            }
        }

        return $errors;
    }

    /**
     * Insert satu baris data (User + Mahasiswa).
     */
    private function insertRow(array $data): void
    {
        $tglLahir = Carbon::parse($data['tanggal_lahir']);
        $tglMasuk = Carbon::parse($data['tanggal_masuk']);
        $prodi = Prodi::where('kode', $data['kode_prodi'])->firstOrFail();

        $nim = $this->nimGenerator->generate($tglMasuk->year, $prodi->id);

        $user = User::create([
            'name'           => $data['nama'],
            'email'          => $data['email'] ?? null,
            'username'       => $nim,
            'password'       => Hash::make($tglLahir->format('dmY')),
            'role'           => 'mahasiswa',
            'is_first_login' => true,
        ]);

        Mahasiswa::create([
            'user_id'       => $user->id,
            'prodi_id'      => $prodi->id,
            'nim'           => $nim,
            'tanggal_lahir' => $tglLahir,
            'tanggal_masuk' => $tglMasuk,
        ]);
    }
}
