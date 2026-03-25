<?php

namespace App\Policies;

use App\Models\Jadwal;
use App\Models\User;

class JadwalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'dosen' || $user->role === 'mahasiswa';
    }

    public function view(User $user, Jadwal $jadwal): bool
    {
        return $user->role === 'admin' || $user->role === 'dosen' || $user->role === 'mahasiswa';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Jadwal $jadwal): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Jadwal $jadwal): bool
    {
        return $user->role === 'admin';
    }
}
