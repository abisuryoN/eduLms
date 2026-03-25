<?php

namespace App\Policies;

use App\Models\Kelas;
use App\Models\User;

class KelasPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'dosen' || $user->role === 'mahasiswa';
    }

    public function view(User $user, Kelas $kelas): bool
    {
        return $user->role === 'admin' || $user->role === 'dosen' || $user->role === 'mahasiswa';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Kelas $kelas): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Kelas $kelas): bool
    {
        return $user->role === 'admin';
    }
}
