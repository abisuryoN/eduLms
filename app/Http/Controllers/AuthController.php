<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) 
    {
        // Controller is concise as per requirements
    }

    public function showLogin() 
    { 
        return view('auth.login'); 
    }

    public function login(Request $request) 
    {
        $data = $request->validate([
            'username' => 'required', 
            'password' => 'required',
        ]);

        if ($this->authService->authenticate($data)) {
            $request->session()->regenerate();
            return redirect()->intended('dashboard');
        }

        return back()->withErrors(['username' => 'Kredensial tidak cocok.'])->onlyInput('username');
    }

    public function logout(Request $request) 
    {
        $this->authService->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }

    public function showRegisterStudent() 
    { 
        return view('auth.register_student'); 
    }

    public function showRegisterLecturer() 
    { 
        return view('auth.register_lecturer'); 
    }

    public function registerStudent(Request $request) 
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'nim' => 'required|string|unique:students,nim',
            'tanggal_lahir' => 'required|date',
            'kelas' => 'required|string',
            'semester' => 'required|integer|min:1|max:8',
            'tahun_masuk' => 'required|integer',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $user = $this->authService->registerStudent($data);
        auth()->login($user);

        return redirect()->route('dashboard')->with('success', 'Registrasi Mahasiswa berhasil. Selamat datang!');
    }

    public function registerLecturer(Request $request) 
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'id_kerja' => 'required|string|unique:lecturers,id_kerja',
            'tanggal_lahir' => 'required|date',
            'fakultas' => 'required|string'
        ]);

        $user = $this->authService->registerLecturer($data);
        auth()->login($user);

        return redirect()->route('dashboard')->with('success', 'Registrasi Dosen berhasil. Selamat datang!');
    }
}
