<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';

    protected $fillable = [
        'user_id', 'kelas_id', 'judul', 'pesan', 'is_read', 'tipe', 'data',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'data'    => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }
}
