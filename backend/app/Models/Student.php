<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\CourseClass;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Payment;

class Student extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function courseClass()
    {
        return $this->belongsTo(CourseClass::class, 'kelas', 'name'); // Since kelas stores the name
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
