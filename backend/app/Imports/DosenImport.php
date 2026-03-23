<?php

namespace App\Imports;

use App\Models\Dosen;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DosenImport implements ToArray, WithHeadingRow
{
    private int $importedCount = 0;
    private array $errors = [];

    public function array(array $rows): void
    {
        foreach ($rows as $index => $row) {
            try {
                $this->processRow($row, $index + 2);
            } catch (\Exception $e) {
                $this->errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
            }
        }
    }

    private function processRow(array $row, int $rowNumber): void
    {
        $required = ['nama', 'id_kerja', 'tanggal_lahir', 'email'];
        foreach ($required as $field) {
            if (empty($row[$field])) {
                throw new \Exception("Kolom '{$field}' wajib diisi.");
            }
        }

        if (User::where('email', $row['email'])->exists()) {
            throw new \Exception("Email '{$row['email']}' sudah terdaftar.");
        }

        if (User::where('username', $row['id_kerja'])->exists()) {
            throw new \Exception("ID Kerja '{$row['id_kerja']}' sudah terdaftar.");
        }

        DB::transaction(function () use ($row) {
            $tglLahir = Carbon::parse($row['tanggal_lahir']);

            $user = User::create([
                'name'           => $row['nama'],
                'email'          => $row['email'],
                'username'       => $row['id_kerja'],
                'password'       => Hash::make($tglLahir->format('dmY')),
                'role'           => 'dosen',
                'is_first_login' => false,
            ]);

            Dosen::create([
                'user_id'       => $user->id,
                'id_kerja'      => $row['id_kerja'],
                'tanggal_lahir' => $tglLahir,
                'no_hp'         => $row['no_hp'] ?? null,
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
