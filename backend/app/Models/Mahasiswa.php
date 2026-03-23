<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    protected $table = 'mahasiswa';

    protected $fillable = [
        'user_id', 'prodi_id', 'nim', 'tanggal_lahir', 'tanggal_masuk',
        'tempat_lahir', 'jenis_kelamin', 'alamat', 'no_hp',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tanggal_masuk' => 'date',
        ];
    }

    /* ── Relationships ─────────────────────────── */

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
        return $this->belongsToMany(Kelas::class, 'kelas_mahasiswa');
    }

    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }

    public function nilai()
    {
        return $this->hasMany(Nilai::class);
    }

    public function jawabanQuiz()
    {
        return $this->hasMany(JawabanMahasiswa::class);
    }

    /* ── Accessors ─────────────────────────────── */

    public function getSemesterAttribute(): int
    {
        $months = $this->tanggal_masuk->diffInMonths(Carbon::now());
        return (int) max(1, ceil($months / 6));
    }
}
