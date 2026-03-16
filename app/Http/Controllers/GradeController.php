<?php

namespace App\Http\Controllers;

use App\Services\GradeService;
use App\Models\Subject;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GradeController extends Controller
{
    public function __construct(protected GradeService $gradeService) {}

    public function index()
    {
        $user = Auth::user();
        if ($user->role->name === 'Dosen') {
            $subjects = Subject::where('lecturer_id', $user->lecturer->id)->get();
            return view('dashboard.grade.lecturer_index', compact('subjects'));
        } else {
            $grades = $this->gradeService->getStudentGrades($user->student->id);
            return view('dashboard.grade.student_index', compact('grades'));
        }
    }

    public function inputForm(Request $request)
    {
        $request->validate(['subject_id' => 'required']);
        $subject = Subject::findOrFail($request->subject_id);
        $students = Student::whereHas('enrollments', function($q) use ($request) {
            $q->where('subject_id', $request->subject_id);
        })->with('user')->get();

        return view('dashboard.grade.input', compact('subject', 'students'));
    }

    public function submit(Request $request)
    {
        $request->validate([
            'subject_id' => 'required',
            'grades' => 'required|array',
        ]);

        foreach ($request->grades as $studentId => $scores) {
            $this->gradeService->inputGrade($studentId, $request->subject_id, $scores);
        }

        return redirect()->route('grade.index')->with('success', 'Nilai berhasil diperbarui.');
    }

    public function history()
    {
        $user = Auth::user();
        if (!$user->student) {
            return back()->with('error', 'Hanya untuk Mahasiswa.');
        }
        $grades = $this->gradeService->getStudentGrades($user->student->id);
        return view('dashboard.grade.history', compact('grades'));
    }
}
