<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\MahasiswaImport;

class MahasiswaService
{
    public function __construct(
        private NimGeneratorService $nimGenerator
    ) {}

    /**
     * Import mahasiswa dari file Excel.
     * Kolom: nama, tanggal_lahir, tanggal_masuk, email, kode_prodi
     */
    public function import(UploadedFile $file): array
    {
        $import = new MahasiswaImport($this->nimGenerator);
        Excel::import($import, $file);

        return [
            'imported' => $import->getImportedCount(),
            'errors'   => $import->getErrors(),
        ];
    }

    /**
     * Create a single mahasiswa manually.
     */
    public function create(array $data): Mahasiswa
    {
        return DB::transaction(function () use ($data) {
            $tglLahir = Carbon::parse($data['tanggal_lahir']);
            $tglMasuk = Carbon::parse($data['tanggal_masuk']);

            $nim = $this->nimGenerator->generate($tglMasuk->year, $data['prodi_id']);

            $user = User::create([
                'name'           => $data['nama'],
                'email'          => $data['email'],
                'username'       => $nim,
                'password'       => Hash::make($tglLahir->format('dmY')),
                'role'           => 'mahasiswa',
                'is_first_login' => true,
            ]);

            return Mahasiswa::create([
                'user_id'       => $user->id,
                'prodi_id'      => $data['prodi_id'],
                'nim'           => $nim,
                'tanggal_lahir' => $tglLahir,
                'tanggal_masuk' => $tglMasuk,
            ]);
        });
    }

    /**
     * Update biodata mahasiswa.
     */
    public function updateBiodata(Mahasiswa $mahasiswa, array $data): Mahasiswa
    {
        $mahasiswa->update(array_filter([
            'tempat_lahir'  => $data['tempat_lahir'] ?? null,
            'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
            'alamat'        => $data['alamat'] ?? null,
            'no_hp'         => $data['no_hp'] ?? null,
        ]));

        return $mahasiswa->fresh();
    }
}
