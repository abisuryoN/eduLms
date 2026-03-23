<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginSlide extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'author',
        'sub',
        'active',
        'order',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
