<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThesisSubmission extends Model
{
    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Lecturer::class, 'lecturer_id');
    }
}
