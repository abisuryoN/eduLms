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
        'image',
        'active',
        'order',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
