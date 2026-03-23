<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PembimbingAkademik extends Model
{
    protected $table = 'pembimbing_akademik';

    protected $fillable = [
        'dosen_id',
        'kelas_id',
    ];

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }
}
