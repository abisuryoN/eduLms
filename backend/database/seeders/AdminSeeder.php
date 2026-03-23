<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name'           => 'Administrator',
                'email'          => 'admin@unindra.ac.id',
                'username'       => 'admin',
                'password'       => Hash::make('admin123'),
                'role'           => 'admin',
                'is_first_login' => false,
            ]
        );
    }
}
