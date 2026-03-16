<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $guarded = [];

    public function courseClass()
    {
        return $this->belongsTo(CourseClass::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
