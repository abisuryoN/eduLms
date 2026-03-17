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
        return Grade::where('student_id', $studentId)
            ->with(['subject'])
            ->get()
            ->groupBy(function($grade) {
                return $grade->subject->semester;
            });
    }

    public function calculateGPA($grades)
    {
        $totalPoints = 0;
        $totalSks = 0;

        foreach ($grades as $grade) {
            $score = ($grade->tugas * 0.3) + ($grade->uts * 0.3) + ($grade->uas * 0.4);
            $point = 0;
            if ($score >= 80) $point = 4.0;
            elseif ($score >= 70) $point = 3.0;
            elseif ($score >= 60) $point = 2.0;
            elseif ($score >= 50) $point = 1.0;
            
            $totalPoints += ($point * $grade->subject->sks);
            $totalSks += $grade->subject->sks;
        }

        return $totalSks > 0 ? round($totalPoints / $totalSks, 2) : 0;
    }
}
