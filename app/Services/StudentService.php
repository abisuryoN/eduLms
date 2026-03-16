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
                'biodata' => encrypt($data['biodata']), // Encrypting sensitive data manually or rely on casts
                'cv_file' => $cvPath
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
