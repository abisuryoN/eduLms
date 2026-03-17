<?php

namespace App\Http\Controllers;

use App\Services\ClassService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassController extends Controller
{
    public function __construct(protected ClassService $classService) {}

    public function index()
    {
        $user = Auth::user();
        if ($user->role->name !== 'Mahasiswa') {
            return back()->with('error', 'Akses hanya untuk Mahasiswa.');
        }

        $student = $user->student;
        $classmates = $this->classService->getStudentsByClassName($student->kelas);
        $subjects = $this->classService->getStudentEnrolledSubjects($student->id, $student->semester);
        
        return view('dashboard.kelas.index', compact('student', 'classmates', 'subjects'));
    }

    public function show(int $subjectId)
    {
        $user = Auth::user();
        if ($user->role->name !== 'Mahasiswa') {
            return back()->with('error', 'Akses hanya untuk Mahasiswa.');
        }

        $materials = $this->classService->getSubjectMaterials($user->student->id, $subjectId);
        return view('dashboard.kelas.materi', compact('materials', 'subjectId'));
    }
}
