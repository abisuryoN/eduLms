<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Material;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Services\ClassService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function __construct(protected ClassService $classService) {}

    public function index()
    {
        $user = Auth::user();
        $subjects = $this->classService->getStudentEnrolledSubjects($user->student->id);
        return view('dashboard.matakuliah.index', compact('subjects'));
    }

    public function materiIndex()
    {
        $user = Auth::user();
        $subjects = $this->classService->getStudentEnrolledSubjects($user->student->id);
        return view('dashboard.materi.index', compact('subjects'));
    }

    public function materiDetail($subject_id)
    {
        $subject = Subject::findOrFail($subject_id);
        $materials = Material::where('subject_id', $subject_id)
            ->orderBy('meeting_number')
            ->get()
            ->groupBy('meeting_number');

        return view('dashboard.materi.detail', compact('subject', 'materials'));
    }

    public function tugasIndex()
    {
        $user = Auth::user();
        $subjects = $this->classService->getStudentEnrolledSubjects($user->student->id);
        return view('dashboard.tugas.index', compact('subjects'));
    }

    public function tugasDetail($subject_id)
    {
        $subject = Subject::findOrFail($subject_id);
        $assignments = Assignment::whereHas('courseClass', function($q) {
            $q->where('name', Auth::user()->student->kelas);
        })->get();

        return view('dashboard.tugas.detail', compact('subject', 'assignments'));
    }

    public function submitAssignment(Request $request)
    {
        $request->validate([
            'assignment_id' => 'required|exists:assignments,id',
            'file' => 'required|file|max:10240', // 10MB
        ]);

        $path = $request->file('file')->store('assignments', 'public');

        AssignmentSubmission::create([
            'student_id' => Auth::user()->student->id,
            'assignment_id' => $request->assignment_id,
            'file_path' => $path,
            'status' => 'submitted',
        ]);

        return back()->with('success', 'Tugas berhasil dikumpulkan!');
    }
}
