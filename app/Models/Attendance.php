<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CourseClass;
use App\Models\Subject;

class Attendance extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'student_checklist' => 'array',
        ];
    }

    public function courseClass()
    {
        return $this->belongsTo(CourseClass::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
