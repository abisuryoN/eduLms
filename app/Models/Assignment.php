<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $guarded = [];

    public function courseClass()
    {
        return $this->belongsTo(CourseClass::class);
    }
}
