<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fakultas extends Model
{
    protected $table = 'fakultas';

    protected $fillable = ['kode', 'nama'];

    public function prodi()
    {
        return $this->hasMany(Prodi::class);
    }
}
