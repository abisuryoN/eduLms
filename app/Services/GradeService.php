<?php

namespace App\Services;

use App\Models\Grade;

class GradeService
{
    /**
     * Input or update grades for a student.
     */
    public function inputGrade(int $studentId, int $subjectId, array $data)
    {
        return Grade::updateOrCreate(
            ['student_id' => $studentId, 'subject_id' => $subjectId],
            [
                'tugas' => $data['tugas'] ?? 0,
                'uts' => $data['uts'] ?? 0,
                'uas' => $data['uas'] ?? 0,
            ]
        );
    }

    /**
     * Get grades for a student.
     */
    public function getStudentGrades(int $studentId)
    {
        return Grade::where('student_id', $studentId)->with('subject')->get();
    }
}
