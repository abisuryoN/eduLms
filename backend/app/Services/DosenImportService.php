<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\DosenImport;
use Exception;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class DosenImportService
{
    private array $prodiIds = [];
    private array $existingEmails = [];
    private array $existingIdKerja = [];

    private function initCache(): void
    {
        // Menyimpan daftar ID prodi ke array untuk validasi cepat
        $this->prodiIds = Prodi::pluck('id')->toArray();
        $this->existingEmails = User::whereNotNull('email')->pluck('email')->toArray();
        $this->existingIdKerja = User::where('role', 'dosen')->pluck('username')->toArray();
        $this->existingDosens = Dosen::pluck('id_kerja')->toArray();
    }

    public function import(UploadedFile $file): array
    {
        try {
            set_time_limit(300);
            $this->initCache();
            $import = new DosenImport();
            Excel::import($import, $file);

            $rows = $import->getParsedRows();
            if (empty($rows)) {
                return ['success' => false, 'message' => 'File kosong'];
            }

            $validUsers = [];
            $validDosens = [];
            $errors = [];
            $importedCount = 0;
            $now = Carbon::now();

            $defaultPassword = Hash::make('123456');

            foreach ($rows as $row) {
                $rowNum = $row['row_number'];
                $data = $row['data'];
                $rowErrors = [];

                // Log payload yang masuk untuk debugging (opsional, hapus/comment di production)
                Log::info("Row Excel {$rowNum}: ", $data);

                // Validasi id_kerja (Wajib & Unik)
                $idKerja = trim($data['id_kerja'] ?? '');
                if (empty($idKerja)) {
                    $rowErrors[] = "Kolom id_kerja wajib diisi.";
                } elseif (in_array($idKerja, $this->existingDosens)) {
                    $rowErrors[] = "Dosen dengan ID Kerja '{$idKerja}' sudah ada di database (Di-skip).";
                }

                $isNewUser = !in_array($idKerja, $this->existingIdKerja);

                // Validasi nama (Wajib)
                $nama = trim($data['nama'] ?? '');
                if (empty($nama)) {
                    $rowErrors[] = "Kolom nama wajib diisi.";
                }

                // Validasi Tanggal Lahir & Handle format Excel Numeric
                $tglLahirRaw = $data['tanggal_lahir'] ?? null;
                $tglLahirCarbon = $this->parseExcelDate($tglLahirRaw);
                if (!$tglLahirCarbon) {
                    $rowErrors[] = "Kolom tanggal_lahir kosong atau formatnya tidak valid.";
                }

                // Validasi Email (Optional, tapi jika ada harus valid & unik)
                $email = trim($data['email'] ?? '');
                if (!empty($email)) {
                    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $rowErrors[] = "Format email '{$email}' tidak valid.";
                    } elseif (in_array($email, $this->existingEmails)) {
                        $rowErrors[] = "Email '{$email}' sudah digunakan.";
                    }
                } else {
                    $email = null;
                }

                // Validasi prodi_id (Wajib)
                $prodiIdRaw = trim($data['prodi_id'] ?? '');
                if (empty($prodiIdRaw)) {
                    $rowErrors[] = "Kolom prodi_id wajib diisi.";
                    $finalProdiId = null;
                } else {
                    $finalProdiId = (int) $prodiIdRaw;
                    if (!in_array($finalProdiId, $this->prodiIds)) {
                        $rowErrors[] = "Prodi ID '{$prodiIdRaw}' tidak ditemukan di database.";
                    }
                }

                $noHp = trim($data['no_hp'] ?? '') ?: null;
                $keahlian = trim($data['keahlian'] ?? '') ?: null;

                if (!empty($rowErrors)) {
                    $errors[] = [
                        'row' => $rowNum,
                        'messages' => $rowErrors
                    ];
                } else {
                    if ($isNewUser) {
                        $validUsers[] = [
                            'name'           => $nama,
                            'email'          => $email,
                            'username'       => $idKerja,
                            'password'       => $defaultPassword,
                            'role'           => 'dosen',
                            'is_first_login' => true,
                            'created_at'     => $now,
                            'updated_at'     => $now,
                        ];
                    }

                    $validDosens[] = [
                        'id_kerja'       => $idKerja,
                        'prodi_id'       => $finalProdiId,
                        'tanggal_lahir'  => $tglLahirCarbon ? $tglLahirCarbon->format('Y-m-d') : null,
                        'no_hp'          => $noHp,
                        'keahlian'       => $keahlian,
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ];
                    
                    $this->existingIdKerja[] = $idKerja;
                    $this->existingDosens[] = $idKerja;
                    if ($email) $this->existingEmails[] = $email;

                    $importedCount++;
                }
            }

            if ($importedCount > 0) {
                DB::transaction(function () use ($validUsers, $validDosens) {
                    if (!empty($validUsers)) {
                        $userChunks = array_chunk($validUsers, 200);
                        foreach ($userChunks as $chunk) {
                            User::insert($chunk);
                        }
                    }

                    $dosenIdKerjas = array_column($validDosens, 'id_kerja');
                    $userMap = User::whereIn('username', $dosenIdKerjas)->pluck('id', 'username')->toArray();

                    foreach ($validDosens as &$dosenData) {
                        $dosenData['user_id'] = $userMap[$dosenData['id_kerja']] ?? null;
                    }
                    unset($dosenData);

                    $dosenChunks = array_chunk($validDosens, 200);
                    foreach ($dosenChunks as $chunk) {
                        Dosen::insert($chunk);
                    }
                });
            }

            if (!empty($errors)) {
                return [
                    'success' => true,
                    'partial' => true,
                    'message' => "Import selesai. Berhasil: $importedCount baris. Gagal: " . count($errors) . " baris.",
                    'data_berhasil' => $importedCount,
                    'errors' => $errors
                ];
            }

            return [
                'success' => true,
                'message' => "Berhasil! Seluruh data ($importedCount baris) berhasil diimport tanpa error.",
                'total' => $importedCount,
            ];

        } catch (Exception $e) {
            Log::error("Import Dosen Fatal Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()];
        }
    }

    private function parseExcelDate($value): ?Carbon
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
}
