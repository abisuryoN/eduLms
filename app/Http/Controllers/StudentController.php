<?php

namespace App\Http\Controllers;

use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function __construct(protected StudentService $studentService) {}

    public function showCompleteBiodata()
    {
        return view('auth.complete_biodata');
    }

    public function completeBiodata(Request $request)
    {
        $data = $request->validate([
            'biodata' => 'required|string',
            'cv_file' => 'required|file|mimes:pdf,doc,docx|max:5120'
        ]);

        $this->studentService->completeBiodata(Auth::user()->id, $data);

        return redirect()->route('dashboard')->with('success', 'Biodata berhasil dilengkapi!');
    }

    public function krsIndex()
    {
        return view('dashboard.krs.index');
    }
}
