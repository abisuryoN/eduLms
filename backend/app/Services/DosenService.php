<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\DosenImport;

class DosenService
{
    /**
     * Import dosen dari file Excel.
     * Kolom: nama, id_kerja, tanggal_lahir, email, no_hp
     */
    public function import(UploadedFile $file): array
    {
        $import = new DosenImport();
        Excel::import($import, $file);

        return [
            'imported' => $import->getImportedCount(),
            'errors'   => $import->getErrors(),
        ];
    }

    /**
     * Create a single dosen manually.
     */
    public function create(array $data): Dosen
    {
        return DB::transaction(function () use ($data) {
            $tglLahir = Carbon::parse($data['tanggal_lahir']);

            $user = User::create([
                'name'           => $data['nama'],
                'email'          => $data['email'],
                'username'       => $data['id_kerja'],
                'password'       => Hash::make($tglLahir->format('dmY')),
                'role'           => 'dosen',
                'is_first_login' => false,
            ]);

            return Dosen::create([
                'user_id'       => $user->id,
                'id_kerja'      => $data['id_kerja'],
                'tanggal_lahir' => $tglLahir,
                'no_hp'         => $data['no_hp'] ?? null,
            ]);
        });
    }
}
