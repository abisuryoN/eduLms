<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Lecturer;
use App\Models\Student;
use App\Models\CourseClass;
use App\Models\Subject;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Attendance;
use App\Models\Material;
use App\Models\Assignment;
use App\Models\ThesisSubmission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // 1. ROLES
        $roleMahasiswa = Role::firstOrCreate(['name' => 'Mahasiswa']);
        $roleDosen = Role::firstOrCreate(['name' => 'Dosen']);

        $faculties = ['Teknik', 'Ekonomi', 'Hukum', 'Ilmu Komputer', 'Sastra'];
        $majors = ['RJ', 'TI', 'SI'];
        $targetSemesters = [2, 4, 6, 8, 10, 12, 14];

        // 2. DOSEN (200)
        $this->command->info('Seeding Lecturers...');
        $lecturers = [];
        $lecturerTitles = [', M.Kom', ', M.T', ', M.Sn', ', M.Hum', ', M.M', ', M.Pd', ', M.Si', ', M.E'];
        
        for ($i = 0; $i < 200; $i++) {
            $dob = $faker->date('Y-m-d', '1990-01-01');
            $password = date('dmY', strtotime($dob));
            
            // Absolute unique sequential ID
            $username = 'D' . str_pad($i + 1, 6, '0', STR_PAD_LEFT);

            $user = User::create([
                'name' => $faker->name . $faker->randomElement($lecturerTitles),
                'username' => $username,
                'password' => Hash::make($password),
                'role_id' => 2,
                'is_biodata_completed' => true,
            ]);

            $lecturers[] = Lecturer::create([
                'user_id' => $user->id,
                'id_kerja' => $user->username,
                'tanggal_lahir' => $dob,
                'fakultas' => $faker->randomElement($faculties),
            ]);
        }

        // 3. MATA KULIAH & KELAS
        $this->command->info('Seeding Subjects & Classes...');
        $allSubjects = [];
        $allClasses = [];

        foreach ($majors as $major) {
            for ($s = 1; $s <= 14; $s++) {
                $class = CourseClass::create([
                    'name' => $major,
                    'semester' => $s
                ]);
                $allClasses[$major][$s] = $class->id;

                for ($j = 1; $j <= 5; $j++) {
                    $subject = Subject::create([
                        'name' => "MK $major Sem $s - " . $faker->words(2, true),
                        'sks' => $faker->randomElement([2, 3, 4]),
                        'lecturer_id' => $faker->randomElement($lecturers)->id,
                    ]);
                    $allSubjects[$major][$s][] = $subject->id;
                    
                    Material::create([
                        'course_class_id' => $class->id,
                        'subject_id' => $subject->id,
                        'title' => 'Materi ' . $subject->name,
                        'file_path' => 'materials/sample.pdf',
                    ]);

                    Assignment::create([
                        'course_class_id' => $class->id,
                        'title' => 'Tugas ' . $subject->name,
                        'description' => $faker->sentence,
                        'due_date' => Carbon::now()->addDays(7),
                    ]);
                }
            }
        }

        // 4. MAHASISWA & HISTORY (2000)
        $this->command->info('Seeding Students & History...');
        $classStudentGroups = []; 

        for ($i = 0; $i < 2000; $i++) {
            $major = $faker->randomElement($majors);
            $currentSemester = $faker->randomElement($targetSemesters);
            $dob = $faker->date('Y-m-d', '2006-01-01');
            $password = date('dmY', strtotime($dob));
            
            // Unique sequential NIM construction
            $nim = '202' . ($currentSemester > 9 ? $currentSemester : '0'.$currentSemester) . str_pad($i + 1, 6, '0', STR_PAD_LEFT);

            $user = User::create([
                'name' => $faker->firstName . ' ' . $faker->lastName,
                'username' => $nim,
                'password' => Hash::make($password),
                'role_id' => 1,
                'is_biodata_completed' => true,
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'nim' => $nim,
                'tanggal_lahir' => $dob,
                'kelas' => $major,
                'semester' => $currentSemester,
                'tahun_masuk' => 2026 - ceil($currentSemester/2),
                'foto' => 'https://i.pravatar.cc/300?u=' . $nim,
            ]);

            $classStudentGroups[$major][$currentSemester][] = $student->id;

            $enrollments = [];
            $grades = [];

            for ($s = 1; $s <= $currentSemester; $s++) {
                $subjectsInSem = $allSubjects[$major][$s] ?? [];
                foreach ($subjectsInSem as $subId) {
                    $enrollments[] = [
                        'student_id' => $student->id,
                        'course_class_id' => $allClasses[$major][$s],
                        'subject_id' => $subId,
                        'semester' => (string)$s,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $grades[] = [
                        'student_id' => $student->id,
                        'subject_id' => $subId,
                        'tugas' => $faker->numberBetween(70, 95),
                        'uts' => $faker->numberBetween(65, 95),
                        'uas' => $faker->numberBetween(65, 95),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            
            Enrollment::insert($enrollments);
            Grade::insert($grades);

            if ($currentSemester >= 8 && $faker->boolean(50)) {
                ThesisSubmission::create([
                    'student_id' => $student->id,
                    'lecturer_id' => $faker->randomElement($lecturers)->id,
                    'title' => 'Analisis ' . $faker->words(3, true),
                    'status' => $faker->randomElement(['pending', 'approved', 'rejected']),
                    'submission_date' => Carbon::now()->subMonths($faker->numberBetween(1, 6)),
                ]);
            }

            if ($i % 100 == 0) $this->command->info("Seeded $i students...");
        }

        // 5. ATTENDANCE
        $this->command->info('Seeding Attendance records...');
        $attendances = [];
        foreach ($majors as $major) {
            foreach ($targetSemesters as $s) {
                if (!isset($classStudentGroups[$major][$s])) continue;
                
                $studentsInInClass = $classStudentGroups[$major][$s];
                $subjects = $allSubjects[$major][$s] ?? [];
                $classId = $allClasses[$major][$s];

                foreach ($subjects as $subId) {
                    for ($w = 1; $w <= 14; $w++) {
                        $presentStudents = $faker->randomElements(
                            $studentsInInClass, 
                            $faker->numberBetween(count($studentsInInClass) * 0.8, count($studentsInInClass))
                        );

                        $attendances[] = [
                            'course_class_id' => $classId,
                            'subject_id' => $subId,
                            'date' => Carbon::now()->subWeeks(15 - $w)->format('Y-m-d'),
                            'student_checklist' => json_encode($presentStudents),
                            'is_closed' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
        }
        
        foreach (array_chunk($attendances, 500) as $chunk) {
            Attendance::insert($chunk);
        }

        $this->command->info('Seeding complete!');
    }
}
