<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Subject;

class AttendanceService
{
    /**
     * Record attendance for a session.
     */
    public function recordAttendance(int $classId, int $subjectId, array $studentChecklist)
    {
        return Attendance::create([
            'course_class_id' => $classId,
            'subject_id' => $subjectId,
            'date' => now(),
            'student_checklist' => $studentChecklist,
        ]);
    }

    /**
     * Get students enrolled in a class.
     */
    public function getStudentsByClass(int $classId)
    {
        return Student::whereHas('enrollments', function ($query) use ($classId) {
            $query->where('course_class_id', $classId);
        })->with('user')->get();
    }

    public function getStudentAttendanceSummary(int $studentId, int $semester = null)
    {
        $query = Subject::whereHas('enrollments', function($q) use ($studentId) {
            $q->where('student_id', $studentId);
        });

        if ($semester) {
            $query->where('semester', $semester);
        }

        $subjects = $query->get();

        $summary = [];
        foreach ($subjects as $subject) {
            $totalClasses = 14; // Default total meetings
            $attendedCount = Attendance::where('subject_id', $subject->id)
                ->whereJsonContains('student_checklist', (string)$studentId)
                ->count();
            
            $percentage = ($totalClasses > 0) ? ($attendedCount / $totalClasses) * 100 : 0;
            $summary[] = (object)[
                'subject_name' => $subject->name,
                'attended' => $attendedCount,
                'total' => $totalClasses,
                'percentage' => round($percentage, 1)
            ];
        }

        return $summary;
    }
}
