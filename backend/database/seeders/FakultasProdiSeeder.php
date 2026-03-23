<?php

namespace Database\Seeders;

use App\Models\Fakultas;
use App\Models\Prodi;
use Illuminate\Database\Seeder;

class FakultasProdiSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'kode' => '10',
                'nama' => 'Fakultas Ilmu Pendidikan dan Pengetahuan Sosial',
                'prodi' => [
                    ['kode' => '01', 'nama' => 'Bimbingan dan Konseling', 'jenjang' => 'S1'],
                    ['kode' => '02', 'nama' => 'Pendidikan Ekonomi', 'jenjang' => 'S1'],
                    ['kode' => '03', 'nama' => 'Pendidikan Sejarah', 'jenjang' => 'S1'],
                    ['kode' => '04', 'nama' => 'Pendidikan IPS', 'jenjang' => 'S1'],
                ],
            ],
            [
                'kode' => '20',
                'nama' => 'Fakultas Bahasa dan Seni',
                'prodi' => [
                    ['kode' => '05', 'nama' => 'Pendidikan Bahasa dan Sastra Indonesia', 'jenjang' => 'S1'],
                    ['kode' => '06', 'nama' => 'Pendidikan Bahasa Inggris', 'jenjang' => 'S1'],
                    ['kode' => '07', 'nama' => 'Desain Komunikasi Visual', 'jenjang' => 'S1'],
                ],
            ],
            [
                'kode' => '30',
                'nama' => 'Fakultas Matematika dan IPA',
                'prodi' => [
                    ['kode' => '08', 'nama' => 'Pendidikan Matematika', 'jenjang' => 'S1'],
                    ['kode' => '09', 'nama' => 'Pendidikan Biologi', 'jenjang' => 'S1'],
                    ['kode' => '10', 'nama' => 'Pendidikan Fisika', 'jenjang' => 'S1'],
                ],
            ],
            [
                'kode' => '40',
                'nama' => 'Fakultas Teknik dan Ilmu Komputer',
                'prodi' => [
                    ['kode' => '11', 'nama' => 'Teknik Informatika', 'jenjang' => 'S1'],
                    ['kode' => '12', 'nama' => 'Teknik Industri', 'jenjang' => 'S1'],
                    ['kode' => '13', 'nama' => 'Teknik Sipil', 'jenjang' => 'S1'],
                    ['kode' => '14', 'nama' => 'Arsitektur', 'jenjang' => 'S1'],
                ],
            ],
            [
                'kode' => '50',
                'nama' => 'Pascasarjana',
                'prodi' => [
                    ['kode' => '15', 'nama' => 'Pendidikan Bahasa Inggris', 'jenjang' => 'S2'],
                    ['kode' => '16', 'nama' => 'Pendidikan Bahasa Indonesia', 'jenjang' => 'S2'],
                    ['kode' => '17', 'nama' => 'Ilmu Pendidikan', 'jenjang' => 'S2'],
                    ['kode' => '18', 'nama' => 'Doktor Ilmu Pendidikan', 'jenjang' => 'S3'],
                ],
            ],
        ];

        foreach ($data as $fak) {
            $fakultas = Fakultas::updateOrCreate(
                ['kode' => $fak['kode']],
                ['nama' => $fak['nama']]
            );

            foreach ($fak['prodi'] as $p) {
                Prodi::updateOrCreate(
                    ['kode' => $p['kode']],
                    [
                        'fakultas_id' => $fakultas->id,
                        'nama'        => $p['nama'],
                        'jenjang'     => $p['jenjang'],
                    ]
                );
            }
        }
    }
}
