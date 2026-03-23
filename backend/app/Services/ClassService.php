<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Subject;

class ClassService
{
    /**
     * Get subjects where the student is enrolled.
     */
    public function getStudentEnrolledSubjects(int $studentId, int $semester = null)
    {
        $query = Subject::whereHas('enrollments', function ($query) use ($studentId) {
            $query->where('student_id', $studentId);
        });

        if ($semester) {
            $query->where('semester', $semester);
        }

        return $query->with('lecturer')->get();
    }

    /**
     * Get materials for a specific subject restricted by student enrollment.
     */
    public function getSubjectMaterials(int $studentId, int $subjectId)
    {
        // Check if student is enrolled in this subject
        $isEnrolled = Enrollment::where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->exists();

        if (!$isEnrolled) {
            return collect();
        }

        return Material::where('subject_id', $subjectId)->get();
    }

    /**
     * Verify if a student has access to a specific class.
     */
    public function verifyStudentAccess(int $studentId, int $classId): bool
    {
        return Enrollment::where('student_id', $studentId)
            ->where('course_class_id', $classId)
            ->exists();
    }
    public function getStudentsByClassName(string $className)
    {
        return \App\Models\Student::where('kelas', $className)->with('user')->get();
    }
}
