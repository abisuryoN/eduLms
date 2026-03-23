<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;

class StudentService
{
    /**
     * Handle updating student biodata and uploading CV
     */
    public function completeBiodata(int $userId, array $data)
    {
        $cvPath = null;
        if (isset($data['cv_file'])) {
            $cvPath = $data['cv_file']->store('cvs', 'public');
        }

        $student = Student::where('user_id', $userId)->first();
        if ($student) {
            $student->update([
                'biodata' => $data['biodata'],
                'cv_file' => $cvPath,
                'nik' => $data['nik'] ?? null,
                'npwp' => $data['npwp'] ?? null,
                'tempat_lahir' => $data['tempat_lahir'] ?? null,
                'agama' => $data['agama'] ?? null,
                'kewarganegaraan' => $data['kewarganegaraan'] ?? null,
                'no_telp' => $data['no_telp'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                'status_perkawinan' => $data['status_perkawinan'] ?? null,
                'golongan_darah' => $data['golongan_darah'] ?? null,
                'berat_badan' => $data['berat_badan'] ?? null,
                'tinggi_badan' => $data['tinggi_badan'] ?? null,
                'ukuran_baju' => $data['ukuran_baju'] ?? null,
                'alamat_lengkap' => $data['alamat_lengkap'] ?? null,
                'nama_ayah' => $data['nama_ayah'] ?? null,
                'nama_ibu' => $data['nama_ibu'] ?? null,
                'nama_wali' => $data['nama_wali'] ?? null,
                'no_telp_ortu' => $data['no_telp_ortu'] ?? null,
                'sekolah_asal' => $data['sekolah_asal'] ?? null,
            ]);
        }

        User::where('id', $userId)->update(['is_biodata_completed' => true]);
    }

    /**
     * Get student dashboard data (IPK, Tagihan, Semester, SKS).
     */
    public function getDashboardData(int $studentId)
    {
        // To be implemented
    }
}
