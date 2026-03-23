<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $table = 'quiz';

    protected $fillable = [
        'kelas_id', 'judul', 'deskripsi', 'durasi_menit', 'pertemuan', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function soal()
    {
        return $this->hasMany(Soal::class);
    }

    public function jawaban()
    {
        return $this->hasMany(JawabanMahasiswa::class);
    }
}
