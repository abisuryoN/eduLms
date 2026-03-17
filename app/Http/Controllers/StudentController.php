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
            'biodata' => 'nullable|string',
            'cv_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'nik' => 'nullable|string',
            'npwp' => 'nullable|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'agama' => 'nullable|string',
            'kewarganegaraan' => 'nullable|string',
            'no_telp' => 'nullable|string',
            'jenis_kelamin' => 'nullable|string',
            'status_perkawinan' => 'nullable|string',
            'golongan_darah' => 'nullable|string',
            'berat_badan' => 'nullable|integer',
            'tinggi_badan' => 'nullable|integer',
            'ukuran_baju' => 'nullable|string',
            'alamat_lengkap' => 'nullable|string',
            'nama_ayah' => 'nullable|string',
            'nama_ibu' => 'nullable|string',
            'nama_wali' => 'nullable|string',
            'no_telp_ortu' => 'nullable|string',
            'sekolah_asal' => 'nullable|string',
        ]);

        $this->studentService->completeBiodata(Auth::user()->id, $data);

        return redirect()->route('dashboard')->with('success', 'Biodata berhasil dilengkapi!');
    }

    public function krsIndex()
    {
        return view('dashboard.krs.index');
    }
}
