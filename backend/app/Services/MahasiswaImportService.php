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
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Exception;

class MahasiswaImportService
{
    private array $prodiMap = [];
    private array $existingEmails = [];

    public function __construct(
        private NimGeneratorService $nimGenerator
    ) {}

    private function initCache(): void
    {
        $this->prodiMap = Prodi::pluck('id', 'kode')->toArray();
        $this->existingEmails = User::whereNotNull('email')->pluck('email')->toArray();
    }

    /**
     * Preview data dari file Excel tanpa menyimpan ke database.
     */
    public function preview(UploadedFile $file): array
    {
        try {
            set_time_limit(300);
            $this->initCache();
            $import = new MahasiswaImport($this->nimGenerator);
            Excel::import($import, $file);

            $rows = $import->getParsedRows();
            $previews = [];
            $totalValid = 0;
            $totalInvalid = 0;
            $emailsInFile = [];

            foreach ($rows as &$row) {
                $errors = $this->validateRow($row['data'], $row['row_number'], $emailsInFile);

                $nimPreview = null;
                if (empty($errors) && !empty($row['data']['kode_prodi'])) {
                    $prodiId = $this->prodiMap[$row['data']['kode_prodi']] ?? null;
                    if ($prodiId && !empty($row['data']['tanggal_masuk'])) {
                        try {
                            $tahun = Carbon::parse($row['data']['tanggal_masuk'])->year;
                            $nimPreview = $this->nimGenerator->generate($tahun, $prodiId) . ' (preview)';
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
            set_time_limit(300);
            $this->initCache();
            $import = new MahasiswaImport($this->nimGenerator);
            Excel::import($import, $file);

            $rows = $import->getParsedRows();
            $emailsInFile = [];

            // Validate semua baris dulu
            $allErrors = [];
            foreach ($rows as &$row) {
                $errors = $this->validateRow($row['data'], $row['row_number'], $emailsInFile);
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

            // Semua valid → insert batch with chunks di dalam transkasi (Optimasi)
            $importedCount = 0;
            $chunks = array_chunk($rows, 200);

            DB::transaction(function () use ($chunks, &$importedCount) {
                // Optimasi: Hash dilakukan SEKALIGUS di luar loop untuk mempercepat import
                $defaultPassword = Hash::make('123456');

                foreach ($chunks as $chunk) {
                    $usersData = [];
                    $now = now();
                    
                    // Generate NIM run before batch
                    foreach ($chunk as &$row) {
                        $tglLahir = Carbon::parse($row['data']['tanggal_lahir']);
                        $tglMasuk = Carbon::parse($row['data']['tanggal_masuk']);
                        $prodiId = $this->prodiMap[$row['data']['kode_prodi']];
                        $nim = $this->nimGenerator->generate($tglMasuk->year, $prodiId);
                        
                        $row['generated_nim'] = $nim;
                        $row['tgl_lahir_carbon'] = $tglLahir;
                        $row['tgl_masuk_carbon'] = $tglMasuk;
                        $row['prodi_id'] = $prodiId;
                        
                        $usersData[] = [
                            'name' => $row['data']['nama'],
                            'email' => $row['data']['email'] ?? null,
                            'username' => $nim,
                            'password' => $defaultPassword,
                            'role' => 'mahasiswa',
                            'is_first_login' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                    unset($row); // <--- MENCEGAH BUG DUPLIKASI DATA PADA ELEMEN TERAKHIR

                    // Bulk insert Users
                    User::insert($usersData);
                    
                    $mahasiswasData = [];
                    // Ambil users yang baru dibuat berdasarkan username (NIM)
                    $usernames = array_column($usersData, 'username');
                    $userMap = User::whereIn('username', $usernames)->pluck('id', 'username')->toArray();

                    foreach ($chunk as $row) {
                        $mahasiswasData[] = [
                            'user_id' => $userMap[$row['generated_nim']] ?? null,
                            'prodi_id' => $row['prodi_id'],
                            'nim' => $row['generated_nim'],
                            'tanggal_lahir' => $row['tgl_lahir_carbon'],
                            'tanggal_masuk' => $row['tgl_masuk_carbon'],
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                        $importedCount++;
                    }
                    
                    // Bulk insert Mahasiswa
                    Mahasiswa::insert($mahasiswasData);
                }
            });

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
     * Parsing tanggal support string Y-m-d atau numeric Excel serial
     */
    private function parseDate($value): ?Carbon
    {
        if (empty($value)) return null;

        try {
            if (is_numeric($value)) {
                return Carbon::instance(Date::excelToDateTimeObject($value));
            }
            return Carbon::parse($value);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Validasi satu baris data tanpa query db
     * Menggunakan &$data referensi untuk menormalisasi nilai yang sudah diolah.
     */
    private function validateRow(array &$data, int $rowNumber, array &$emailsInFile): array
    {
        $errors = [];
        $prefix = "Baris {$rowNumber}";

        // Normalisasi kode prodi (2 digit pad left)
        if (isset($data['kode_prodi'])) {
            $data['kode_prodi'] = str_pad(trim($data['kode_prodi']), 2, '0', STR_PAD_LEFT);
        }

        // nama: wajib
        if (empty($data['nama'])) {
            $errors[] = "{$prefix}: nama wajib diisi.";
        }

        // tanggal_lahir: wajib, support excel numeric format
        if (empty($data['tanggal_lahir'])) {
            $errors[] = "{$prefix}: tanggal_lahir wajib diisi.";
        } else {
            $parsedDate = $this->parseDate($data['tanggal_lahir']);
            if (!$parsedDate) {
                $errors[] = "{$prefix}: tanggal_lahir tidak valid formatnya.";
            } else {
                $data['tanggal_lahir'] = $parsedDate->format('Y-m-d');
            }
        }

        // tanggal_masuk: wajib
        if (empty($data['tanggal_masuk'])) {
            $errors[] = "{$prefix}: tanggal_masuk wajib diisi.";
        } else {
            $parsedDate = $this->parseDate($data['tanggal_masuk']);
            if (!$parsedDate) {
                $errors[] = "{$prefix}: tanggal_masuk tidak valid formatnya.";
            } else {
                $data['tanggal_masuk'] = $parsedDate->format('Y-m-d');
            }
        }

        // email: optional, jika ada harus valid dan unik
        if (!empty($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "{$prefix}: email tidak valid.";
            } elseif (in_array($data['email'], $this->existingEmails) || in_array($data['email'], $emailsInFile)) {
                $errors[] = "{$prefix}: email '{$data['email']}' sudah terdaftar atau ganda dalam file.";
            } else {
                $emailsInFile[] = $data['email'];
            }
        }

        // kode_prodi: wajib, harus ada di mapping
        if (empty($data['kode_prodi'])) {
            $errors[] = "{$prefix}: kode_prodi wajib diisi.";
        } else {
            if (!isset($this->prodiMap[$data['kode_prodi']])) {
                $errors[] = "{$prefix}: kode_prodi '{$data['kode_prodi']}' tidak ditemukan di sistem.";
            }
        }

        return $errors;
    }
}
