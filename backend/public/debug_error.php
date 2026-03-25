<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\Kelas;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    $result = Kelas::with([
        'prodi.fakultas',
        'teachingAssignments.mataKuliah',
        'teachingAssignments.dosen.user',
        'pembimbingAkademik.dosen.user'
    ])->first();
    echo "Relationship test passed!\n";
    print_r($result ? $result->toArray() : "No data");
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE: " . $e->getTraceAsString() . "\n";
}
