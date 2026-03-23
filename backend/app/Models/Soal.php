<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    protected $table = 'soal';

    protected $fillable = [
        'quiz_id', 'pertanyaan', 'opsi_a', 'opsi_b', 'opsi_c', 'opsi_d',
        'jawaban_benar', 'poin',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function jawaban()
    {
        return $this->hasMany(JawabanMahasiswa::class);
    }
}
