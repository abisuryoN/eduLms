<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Student;

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
            'attendance_date' => now(),
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
}
