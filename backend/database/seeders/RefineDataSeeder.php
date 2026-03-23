<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\CourseClass;
use App\Models\Lecturer;
use Illuminate\Support\Facades\DB;

class RefineDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Clean Student Names (Remove titles like S.E.I, S.IP, etc.)
        $students = Student::with('user')->get();
        foreach ($students as $student) {
            if ($student->user) {
                $cleanName = preg_replace('/\s+S\.[A-Z\.]+$/i', '', $student->user->name);
                $student->user->update(['name' => $cleanName]);
            }
        }

        // 2. Refine Class RJ (Assuming it's the target class)
        $targetClass = CourseClass::where('name', 'RJ')->first();
        if ($targetClass) {
            $classStudents = Student::where('kelas', 'RJ')->get();
            if ($classStudents->count() > 40) {
                // Move extra students to other random classes to keep 40
                $extra = $classStudents->slice(40);
                foreach ($extra as $ext) {
                    $ext->update(['kelas' => 'CLASS-' . rand(1, 10)]);
                }
            }
        }

        // 3. Ensure 8 subjects per semester for Informatika
        $lecturers = Lecturer::all();
        if ($lecturers->isEmpty()) return;

        $prodi = "Teknik Informatika";
        $subjectsData = [
            1 => ["Dasar Pemrograman", "Matematika Diskrit", "Bahasa Inggris I", "PTI", "Agama", "Pancasila", "Alpro I", "Logika Informatika"],
            2 => ["Struktur Data", "Alpro II", "Bahasa Inggris II", "Kalkulus", "Arsitektur Komputer", "Sistem Operasi", "Aljabar Linear", "Kewarganegaraan"],
            3 => ["Basis Data I", "PBO I", "Statistika", "Jaringan Komputer", "Rekayasa Perangkat Lunak", "Metode Numerik", "Grafika Komputer", "Interaksi Manusia & Komputer"],
            4 => ["Basis Data II", "PBO II", "Analisis Desain Algoritma", "Keamanan Informasi", "Kecerdasan Buatan", "Sistem Terdistribusi", "Kriptografi", "Etika Profesi"],
            5 => ["Pemrograman Web I", "Mobile Dev I", "Cloud Computing", "Data Mining", "Machine Learning", "Manajemen Proyek TI", "E-Commerce", "Technopreneur"],
            6 => ["Pemrograman Web II", "Mobile Dev II", "Big Data", "Audit TI", "Sistem Pendukung Keputusan", "Game Dev", "IoT", "Metodologi Penelitian"],
            7 => ["KKN", "PKL / Magang", "Seminar Proposal", "Kualitas Perangkat Lunak", "UI/UX Design", "Forensik Digital", "Pengolahan Citra", "Deep Learning"],
            8 => ["Skripsi / Tugas Akhir", "Etika Bisnis", "Kepemimpinan", "Kewirausahaan Digital", "Soft Skills", "Manajemen Strategis", "Workshop IT", "Bahasa Jepang IT"]
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // Option: we could delete all current subjects to make it clean, but let's just ensure our target has them
        // Subject::truncate(); 
        
        foreach ($subjectsData as $sem => $names) {
            foreach ($names as $name) {
                Subject::updateOrCreate(
                    ['name' => $name, 'semester' => $sem],
                    [
                        'sks' => rand(2, 4),
                        'lecturer_id' => $lecturers->random()->id
                    ]
                );
            }
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 4. Enroll the target student (Jamalia Rahmawati) to exactly 8 subjects of semester 8
        $targetUser = User::where('name', 'Jamalia Rahmawati')->first();
        if ($targetUser && $targetUser->student) {
            $studentId = $targetUser->student->id;
            $classId = $targetClass ? $targetClass->id : 1;
            
            // Clear current enrollments for this student
            Enrollment::where('student_id', $studentId)->delete();
            
            $sem8Subjects = Subject::where('semester', 8)->take(8)->get();
            foreach ($sem8Subjects as $subject) {
                Enrollment::create([
                    'student_id' => $studentId,
                    'course_class_id' => $classId,
                    'subject_id' => $subject->id
                ]);
            }
        }
    }
}
