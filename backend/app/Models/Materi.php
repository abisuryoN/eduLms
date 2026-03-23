<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    protected $table = 'materi';

    protected $fillable = [
        'kelas_id', 'pertemuan', 'judul', 'deskripsi', 'tipe', 'file_path', 'url',
    ];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }
}
