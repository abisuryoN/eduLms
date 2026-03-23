<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JawabanMahasiswa extends Model
{
    protected $table = 'jawaban_mahasiswa';

    protected $fillable = [
        'quiz_id', 'soal_id', 'mahasiswa_id', 'jawaban', 'is_correct', 'poin',
    ];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function soal()
    {
        return $this->belongsTo(Soal::class);
    }

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
