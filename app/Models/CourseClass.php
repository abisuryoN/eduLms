<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseClass extends Model
{
    protected $guarded = [];

    public function students()
    {
        return $this->hasMany(Student::class, 'kelas', 'name'); // Since we match by string name
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}
