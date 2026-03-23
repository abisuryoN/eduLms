<?php

namespace App\Services;

use App\Models\User;
use App\Models\Student;
use App\Models\Lecturer;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManagerStatic as Image; // if using intervention, but keeping simple

class AuthService
{
    public function registerStudent(array $data)
    {
        $role = Role::firstOrCreate(['name' => 'Mahasiswa']);
        $password = date('dmY', strtotime($data['tanggal_lahir']));
        $user = User::create([
            'name' => $data['name'],
            'username' => $data['nim'],
            'password' => Hash::make($password),
            'role_id' => $role->id,
            'is_biodata_completed' => false,
        ]);

        $fotoPath = null;
        if (isset($data['foto'])) {
            // Compress foto in a real app, storing locally for now
            $fotoPath = $data['foto']->store('photos', 'public');
        }

        Student::create([
            'user_id' => $user->id,
            'nim' => $data['nim'],
            'tanggal_lahir' => $data['tanggal_lahir'],
            'kelas' => $data['kelas'],
            'semester' => $data['semester'],
            'tahun_masuk' => $data['tahun_masuk'],
            'foto' => $fotoPath,
        ]);
        return $user;
    }

    public function registerLecturer(array $data)
    {
        $role = Role::firstOrCreate(['name' => 'Dosen']);
        $password = date('dmY', strtotime($data['tanggal_lahir']));
        $user = User::create([
            'name' => $data['name'],
            'username' => $data['id_kerja'],
            'password' => Hash::make($password),
            'role_id' => $role->id,
            'is_biodata_completed' => true, // Dosen might not need CV flow
        ]);

        Lecturer::create([
            'user_id' => $user->id,
            'id_kerja' => $data['id_kerja'],
            'tanggal_lahir' => $data['tanggal_lahir'],
            'fakultas' => $data['fakultas'],
        ]);
        return $user;
    }

    public function authenticate(array $data): bool
    {
        $user = User::where('username', $data['username'])->first();

        if ($user && Hash::check($data['password'], $user->password)) {
            Auth::login($user);
            return true;
        }
        return false;
    }

    public function logout()
    {
        Auth::logout();
    }
}
