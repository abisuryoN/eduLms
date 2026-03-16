<?php

namespace App\Http\Controllers;

use App\Services\AttendanceService;
use App\Models\CourseClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function __construct(protected AttendanceService $attendanceService) {}

    public function index()
    {
        $user = Auth::user();
        if ($user->role->name !== 'Dosen') {
            return back()->with('error', 'Hanya untuk Dosen.');
        }

        $subjects = Subject::where('lecturer_id', $user->lecturer->id)->get();
        $classes = CourseClass::all(); // Simplified

        return view('dashboard.attendance.index', compact('subjects', 'classes'));
    }

    public function showChecklist(Request $request)
    {
        $request->validate(['class_id' => 'required', 'subject_id' => 'required']);
        $students = $this->attendanceService->getStudentsByClass($request->class_id);
        
        return view('dashboard.attendance.checklist', [
            'students' => $students,
            'class_id' => $request->class_id,
            'subject_id' => $request->subject_id
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate(['class_id' => 'required', 'subject_id' => 'required']);
        
        $checklist = $request->input('attendance', []); // student_id => true/false
        $this->attendanceService->recordAttendance($request->class_id, $request->subject_id, $checklist);

        return redirect()->route('attendance.index')->with('success', 'Presensi berhasil disimpan.');
    }
}
