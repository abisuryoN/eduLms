<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Dosen count: " . \App\Models\Dosen::count() . "\n";
echo "Prodis: \n";
print_r(\App\Models\Prodi::all()->toArray());
echo "\nDosen per prodi:\n";
print_r(\App\Models\Dosen::selectRaw('prodi_id, count(*) as total')->groupBy('prodi_id')->get()->toArray());
