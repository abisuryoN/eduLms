<?php

use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Dosen;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$username = '202301054';
$user = User::where('username', $username)->first();

if (!$user) {
    echo "User $username tidak ditemukan.\n";
    $recent = User::latest()->limit(5)->get(['username', 'role', 'created_at']);
    echo "User terbaru:\n";
    foreach ($recent as $r) {
        echo "- {$r->username} ({$r->role}) created at {$r->created_at}\n";
    }
} else {
    echo "User $username ditemukan.\n";
    echo "Role: {$user->role}\n";
    echo "Password (hash): {$user->password}\n";
    
    if ($user->role === 'mahasiswa') {
        $m = Mahasiswa::where('user_id', $user->id)->first();
        if ($m) {
            echo "Tanggal Lahir: {$m->tanggal_lahir}\n";
            $dobPassword = \Illuminate\Support\Facades\Hash::check(
                \Carbon\Carbon::parse($m->tanggal_lahir)->format('dmY'), 
                $user->password
            );
            $legacyPassword = \Illuminate\Support\Facades\Hash::check('123456', $user->password);
            
            echo "Match DOB (dmY)?: " . ($dobPassword ? "YES" : "NO") . "\n";
            echo "Match '123456'?: " . ($legacyPassword ? "YES" : "NO") . "\n";
        }
    }
}
