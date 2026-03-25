<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\AuthenticationException;
use Exception;

class AuthService
{
    public function login(array $credentials)
    {
        $user = User::where('username', $credentials['username'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // Throw standard Laravel AuthenticationException
            throw new AuthenticationException('Username atau password salah.');
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'token' => $token,
            'user'  => $this->formatUser($user),
        ];
    }

    public function logout(User $user)
    {
        return $user->currentAccessToken()->delete();
    }

    public function changePassword(User $user, array $data)
    {
        if (!Hash::check($data['current_password'], $user->password)) {
            throw new Exception('Password lama salah.', 422);
        }

        return DB::transaction(function () use ($user, $data) {
            return $user->update([
                'password'       => Hash::make($data['new_password']),
                'is_first_login' => false,
            ]);
        });
    }

    public function formatUser(User $user): array
    {
        $user->load(['mahasiswa.prodi.fakultas', 'dosen']);
        
        $data = [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'username'       => $user->username,
            'role'           => $user->role,
            'avatar'         => $user->avatar ? url('uploads/profile/' . $user->avatar) : null,
            'is_first_login' => $user->is_first_login,
        ];

        if ($user->isMahasiswa() && $user->mahasiswa) {
            // Count unique subjects from all classes the student is enrolled in
            $totalSubjects = $user->mahasiswa->kelas()
                ->with('subjects')
                ->get()
                ->flatMap(fn($k) => $k->subjects)
                ->pluck('id')
                ->unique()
                ->count();

            $studentData = [
                'id'            => $user->mahasiswa->id,
                'nim'           => $user->mahasiswa->nim,
                'semester'      => $user->mahasiswa->semester,
                'prodi'         => $user->mahasiswa->prodi ? [
                    'id'   => $user->mahasiswa->prodi->id,
                    'nama' => $user->mahasiswa->prodi->nama,
                    'fakultas' => $user->mahasiswa->prodi->fakultas?->nama,
                ] : null,
            ];

            $data['mahasiswa']      = $studentData;
            $data['student']        = $studentData; // Alias for frontend compatibility
            $data['total_subjects'] = $totalSubjects;
        }

        if ($user->isDosen() && $user->dosen) {
            $data['dosen'] = [
                'id'       => $user->dosen->id,
                'id_kerja' => $user->dosen->id_kerja,
                'keahlian' => $user->dosen->keahlian,
            ];
        }

        return $data;
    }
}
