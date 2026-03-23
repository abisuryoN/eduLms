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
            $avg = ($grade->tugas * 0.3) + ($grade->uts * 0.3) + ($grade->uas * 0.4);
            $point = $this->calculatePoint($avg);
            $totalPoints += ($point * $grade->subject->sks);
            $totalSks += $grade->subject->sks;
        }

        return $totalSks > 0 ? round($totalPoints / $totalSks, 2) : 0;
    }

    /**
     * Get IPS trend for each semester.
     */
    public function getGPATrendData(int $studentId)
    {
        $gradesBySemester = Grade::where('student_id', $studentId)
            ->with('subject')
            ->get()
            ->groupBy(function ($grade) {
                return $grade->subject->semester;
            });

        $trend = [];
        for ($i = 1; $i <= 8; $i++) {
            $semesterGrades = $gradesBySemester->get($i, collect());
            if ($semesterGrades->isEmpty()) {
                $trend[$i] = 0;
                continue;
            }
            $trend[$i] = $this->calculateGPA($semesterGrades);
        }

        return $trend;
    }

    private function calculatePoint($score)
    {
        if ($score >= 80) return 4.0;
        if ($score >= 70) return 3.0;
        if ($score >= 60) return 2.0;
        if ($score >= 50) return 1.0;
        return 0;
    }
}
