<?php

namespace App\Imports;

use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use App\Services\NimGeneratorService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MahasiswaImport implements ToArray, WithHeadingRow
{
    private int $importedCount = 0;
    private array $errors = [];

    public function __construct(
        private NimGeneratorService $nimGenerator
    ) {}

    public function array(array $rows): void
    {
        foreach ($rows as $index => $row) {
            try {
                $this->processRow($row, $index + 2); // +2 for header + 0-index
            } catch (\Exception $e) {
                $this->errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
            }
        }
    }

    private function processRow(array $row, int $rowNumber): void
    {
        // Validate required fields
        $required = ['nama', 'tanggal_lahir', 'tanggal_masuk', 'email', 'kode_prodi'];
        foreach ($required as $field) {
            if (empty($row[$field])) {
                throw new \Exception("Kolom '{$field}' wajib diisi.");
            }
        }

        // Find prodi by kode
        $prodi = Prodi::where('kode', $row['kode_prodi'])->first();
        if (!$prodi) {
            throw new \Exception("Kode prodi '{$row['kode_prodi']}' tidak ditemukan.");
        }

        // Check email unique
        if (User::where('email', $row['email'])->exists()) {
            throw new \Exception("Email '{$row['email']}' sudah terdaftar.");
        }

        DB::transaction(function () use ($row, $prodi) {
            $tglLahir = Carbon::parse($row['tanggal_lahir']);
            $tglMasuk = Carbon::parse($row['tanggal_masuk']);

            $nim = $this->nimGenerator->generate($tglMasuk->year, $prodi->id);

            $user = User::create([
                'name'           => $row['nama'],
                'email'          => $row['email'],
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
        });

        $this->importedCount++;
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
