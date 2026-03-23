<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah.',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['mahasiswa.prodi.fakultas', 'dosen']);

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama salah.',
            ], 422);
        }

        $user->update([
            'password'       => Hash::make($request->new_password),
            'is_first_login' => false,
        ]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    /**
     * Format user for API response
     */
    private function formatUser(User $user): array
    {
        $data = [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'username'       => $user->username,
            'role'           => $user->role,
            'avatar'         => $user->avatar ? url('uploads/profile/' . $user->avatar) : null,
            'is_first_login' => $user->is_first_login,
        ];

        if ($user->isMahasiswa() && $user->relationLoaded('mahasiswa') && $user->mahasiswa) {
            $data['mahasiswa'] = [
                'id'            => $user->mahasiswa->id,
                'nim'           => $user->mahasiswa->nim,
                'tanggal_lahir' => $user->mahasiswa->tanggal_lahir?->format('Y-m-d'),
                'tanggal_masuk' => $user->mahasiswa->tanggal_masuk?->format('Y-m-d'),
                'tempat_lahir'  => $user->mahasiswa->tempat_lahir,
                'jenis_kelamin' => $user->mahasiswa->jenis_kelamin,
                'alamat'        => $user->mahasiswa->alamat,
                'no_hp'         => $user->mahasiswa->no_hp,
                'semester'      => $user->mahasiswa->semester,
                'prodi'         => $user->mahasiswa->prodi ? [
                    'id'   => $user->mahasiswa->prodi->id,
                    'nama' => $user->mahasiswa->prodi->nama,
                    'fakultas' => $user->mahasiswa->prodi->fakultas?->nama,
                ] : null,
            ];
        }

        if ($user->isDosen() && $user->relationLoaded('dosen') && $user->dosen) {
            $data['dosen'] = [
                'id'       => $user->dosen->id,
                'id_kerja' => $user->dosen->id_kerja,
                'no_hp'    => $user->dosen->no_hp,
                'keahlian' => $user->dosen->keahlian,
            ];
        }

        return $data;
    }
}
