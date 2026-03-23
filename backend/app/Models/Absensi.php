<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $table = 'absensi';

    protected $fillable = [
        'kelas_id', 'mahasiswa_id', 'pertemuan', 'status', 'tanggal',
    ];

    protected function casts(): array
    {
        return ['tanggal' => 'date'];
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
