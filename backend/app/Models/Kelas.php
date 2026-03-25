<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'mata_kuliah_id', 'dosen_id', 'dosen_pa_id', 'prodi_id', 'fakultas_id', 'nama_kelas', 'semester', 'tahun_ajaran', 'kategori_kelas',
    ];

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class);
    }

    public function dosen()
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }

    public function dosenPA()
    {
        return $this->belongsTo(Dosen::class, 'dosen_pa_id');
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class);
    }

    public function fakultas()
    {
        return $this->belongsTo(Fakultas::class);
    }

    public function mahasiswa()
    {
        return $this->belongsToMany(Mahasiswa::class, 'kelas_mahasiswa');
    }

    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    public function pembimbingAkademik()
    {
        return $this->hasMany(PembimbingAkademik::class);
    }

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function materi()
    {
        return $this->hasMany(Materi::class);
    }

    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }

    public function nilai()
    {
        return $this->hasMany(Nilai::class);
    }

    public function quiz()
    {
        return $this->hasMany(Quiz::class);
    }

    public function chat()
    {
        return $this->hasMany(Chat::class);
    }

    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class);
    }
}
