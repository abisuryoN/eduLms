<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    protected $table = 'dosen';

    protected $fillable = [
        'user_id', 'prodi_id', 'id_kerja', 'tanggal_lahir', 'no_hp', 'alamat', 'keahlian',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class);
    }

    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }

    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    public function pembimbingAkademik()
    {
        return $this->hasMany(PembimbingAkademik::class);
    }
}

