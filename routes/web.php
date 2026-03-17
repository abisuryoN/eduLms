<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LecturerController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

// Authentication System
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Registration System
Route::get('/register', function() {
    return redirect()->route('register.student');
})->name('register');

Route::get('/register/student', [AuthController::class, 'showRegisterStudent'])->name('register.student');
Route::post('/register/student', [AuthController::class, 'registerStudent'])->name('register.student.post');

Route::get('/register/lecturer', [AuthController::class, 'showRegisterLecturer'])->name('register.lecturer');
Route::post('/register/lecturer', [AuthController::class, 'registerLecturer'])->name('register.lecturer.post');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    // First-time Biodata Completion
    Route::get('/complete-biodata', [StudentController::class, 'showCompleteBiodata'])->name('biodata.complete');
    Route::post('/complete-biodata', [StudentController::class, 'completeBiodata']);

    // Dashboard & Academic Features
    // Dashboard is now accessible to all authenticated users
    Route::get('/dashboard', function () {
        if (Auth::user()->role->name === 'Dosen') {
            return redirect()->route('lecturer.dashboard');
        }
        return view('dashboard.home');
    })->name('dashboard');

    Route::get('/lecturer/dashboard', [LecturerController::class, 'dashboard'])->name('lecturer.dashboard');
    Route::get('/lecturer/students', [LecturerController::class, 'students'])->name('lecturer.students');

    Route::get('/profile', [StudentController::class, 'showCompleteBiodata'])->name('profile.show');

    // Academic Features restricted by biodata completion if necessary, but user wants them accessible
    Route::middleware(['biodata'])->group(function () {
        Route::get('/kelas', [ClassController::class, 'index'])->name('kelas.index');
        Route::get('/kelas/{id}', [ClassController::class, 'show'])->name('kelas.show');

        Route::get('/chat/{room?}', [ChatController::class, 'showRoom'])->name('chat.show');
        Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');

        Route::get('/matakuliah', [CourseController::class, 'index'])->name('matakuliah.index');
        Route::get('/materi', [CourseController::class, 'materiIndex'])->name('materi.index');
        Route::get('/materi/{subject_id}', [CourseController::class, 'materiDetail'])->name('materi.detail');
        Route::get('/tugas', [CourseController::class, 'tugasIndex'])->name('tugas.index');
        Route::get('/tugas/{subject_id}', [CourseController::class, 'tugasDetail'])->name('tugas.detail');
        Route::post('/tugas/submit', [CourseController::class, 'submitAssignment'])->name('tugas.submit');

        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::get('/attendance/checklist', [AttendanceController::class, 'showChecklist'])->name('attendance.checklist');
        Route::post('/attendance/submit', [AttendanceController::class, 'submit'])->name('attendance.submit');

        Route::get('/grade', [GradeController::class, 'index'])->name('grade.index');
        Route::get('/grade/history', [GradeController::class, 'history'])->name('grade.history');
        Route::get('/grade/input', [GradeController::class, 'inputForm'])->name('grade.input');
        Route::post('/grade/submit', [GradeController::class, 'submit'])->name('grade.submit');

        Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');
        Route::get('/payment/history', [PaymentController::class, 'history'])->name('payment.history');

        Route::get('/krs', [StudentController::class, 'krsIndex'])->name('krs.index');
    });
});
