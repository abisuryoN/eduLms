<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\CourseClass;
use App\Models\Student;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LecturerController extends Controller
{
    public function dashboard()
    {
        $lecturer = Auth::user()->lecturer;
        $subjects = Subject::where('lecturer_id', $lecturer->id)->with('enrollments')->get();
        $totalStudents = Student::whereHas('enrollments', function($q) use ($lecturer) {
            $q->whereIn('subject_id', Subject::where('lecturer_id', $lecturer->id)->pluck('id'));
        })->distinct()->count();

        return view('dashboard.lecturer.home', compact('subjects', 'totalStudents'));
    }

    public function students()
    {
        $lecturer = Auth::user()->lecturer;
        $students = Student::whereHas('enrollments', function($q) use ($lecturer) {
            $q->whereIn('subject_id', Subject::where('lecturer_id', $lecturer->id)->pluck('id'));
        })->with(['user', 'courseClass'])->get();

        return view('dashboard.lecturer.students', compact('students'));
    }
}
