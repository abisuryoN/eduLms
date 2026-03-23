<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\ImportMahasiswaController;
use App\Http\Controllers\Api\LoginSlideController;
use App\Http\Controllers\Api\MahasiswaController;
use App\Http\Controllers\Api\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Public ───────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login-slides', [LoginSlideController::class, 'index']);

// ── Authenticated ────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // All routes below require first-login check
    Route::middleware(\App\Http\Middleware\FirstLoginMiddleware::class)->group(function () {

        // ── Profile & Notifikasi (all roles) ─────
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);
        Route::get('/notifikasi', [ProfileController::class, 'notifikasi']);
        Route::post('/notifikasi/{id}/read', [ProfileController::class, 'markNotifikasiRead']);
        Route::post('/notifikasi/read-all', [ProfileController::class, 'markAllNotifikasiRead']);

        // ══════════════════════════════════════════
        //  ADMIN ROUTES
        // ══════════════════════════════════════════
        Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':admin')
            ->prefix('admin')
            ->group(function () {
                Route::get('/dashboard', [AdminController::class, 'dashboard']);

                // Import Mahasiswa (dedicated controller)
                Route::post('/import-mahasiswa/preview', [ImportMahasiswaController::class, 'preview']);
                Route::post('/import-mahasiswa', [ImportMahasiswaController::class, 'import']);
                Route::post('/import-dosen', [AdminController::class, 'importDosen']);

                // Reference data
                Route::get('/referensi/options', [AdminController::class, 'referensiOptions']);
                Route::get('/mahasiswa', [AdminController::class, 'mahasiswaList']);
                Route::get('/dosen', [AdminController::class, 'dosenList']);

                // Master Data Management
                Route::apiResource('fakultas', \App\Http\Controllers\Api\FakultasController::class);
                Route::apiResource('prodi', \App\Http\Controllers\Api\ProdiController::class);
                Route::apiResource('mata-kuliah', \App\Http\Controllers\Api\MataKuliahController::class);

                // Kelas
                Route::get('/kelas', [AdminController::class, 'kelasIndex']);
                Route::post('/kelas', [AdminController::class, 'kelasStore']);
                Route::get('/kelas/{kelas}', [AdminController::class, 'kelasShow']);
                Route::put('/kelas/{kelas}', [AdminController::class, 'kelasUpdate']);
                Route::delete('/kelas/{kelas}', [AdminController::class, 'kelasDestroy']);
                Route::post('/kelas/{kelas}/assign-mahasiswa', [AdminController::class, 'assignMahasiswa']);
                Route::post('/kelas/{kelas}/remove-mahasiswa', [AdminController::class, 'removeMahasiswa']);

                // Assignment Dosen
                Route::post('/assign-pengajar', [AdminController::class, 'assignPengajar']);
                Route::delete('/assign-pengajar/{id}', [AdminController::class, 'removePengajar']);
                Route::post('/assign-pa', [AdminController::class, 'assignPA']);
                Route::delete('/assign-pa/{id}', [AdminController::class, 'removePA']);

                // Jadwal
                Route::get('/jadwal', [AdminController::class, 'jadwalIndex']);
                Route::post('/jadwal', [AdminController::class, 'jadwalStore']);
                Route::put('/jadwal/{jadwal}', [AdminController::class, 'jadwalUpdate']);
                Route::delete('/jadwal/{jadwal}', [AdminController::class, 'jadwalDestroy']);

                // Login Slides
                Route::get('/login-slides', [LoginSlideController::class, 'adminIndex']);
                Route::post('/login-slides', [LoginSlideController::class, 'store']);
                Route::put('/login-slides/{loginSlide}', [LoginSlideController::class, 'update']);
                Route::delete('/login-slides/{loginSlide}', [LoginSlideController::class, 'destroy']);
            });

        // ══════════════════════════════════════════
        //  DOSEN ROUTES
        // ══════════════════════════════════════════
        Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':dosen')
            ->prefix('dosen')
            ->group(function () {
                Route::get('/jadwal-hari-ini', [DosenController::class, 'jadwalHariIni']);
                Route::get('/kelas', [DosenController::class, 'kelasList']);
                Route::get('/kelas/{kelas}/mahasiswa', [DosenController::class, 'kelasMahasiswa']);

                // Absensi
                Route::post('/kelas/{kelas}/absensi', [DosenController::class, 'submitAbsensi']);
                Route::get('/kelas/{kelas}/absensi', [DosenController::class, 'getAbsensiKelas']);

                // Materi
                Route::get('/kelas/{kelas}/materi', [DosenController::class, 'materiIndex']);
                Route::post('/kelas/{kelas}/materi', [DosenController::class, 'materiStore']);
                Route::put('/kelas/{kelas}/materi/{materi}', [DosenController::class, 'materiUpdate']);
                Route::delete('/kelas/{kelas}/materi/{materi}', [DosenController::class, 'materiDestroy']);

                // Quiz
                Route::get('/kelas/{kelas}/quiz', [DosenController::class, 'quizIndex']);
                Route::post('/kelas/{kelas}/quiz', [DosenController::class, 'quizStore']);
                Route::put('/kelas/{kelas}/quiz/{quiz}', [DosenController::class, 'quizUpdate']);

                // Nilai
                Route::get('/kelas/{kelas}/nilai', [DosenController::class, 'nilaiIndex']);
                Route::post('/kelas/{kelas}/nilai', [DosenController::class, 'nilaiStore']);

                // Notifikasi
                Route::post('/kelas/{kelas}/notifikasi', [DosenController::class, 'sendNotifikasi']);
            });

        // ══════════════════════════════════════════
        //  MAHASISWA ROUTES
        // ══════════════════════════════════════════
        Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':mahasiswa')
            ->prefix('mahasiswa')
            ->group(function () {
                Route::get('/dashboard', [MahasiswaController::class, 'dashboard']);
                Route::get('/jadwal', [MahasiswaController::class, 'jadwal']);
                Route::get('/kelas', [MahasiswaController::class, 'kelasList']);

                // Materi
                Route::get('/kelas/{kelas}/materi', [MahasiswaController::class, 'materiByKelas']);

                // Quiz
                Route::get('/kelas/{kelas}/quiz', [MahasiswaController::class, 'quizByKelas']);
                Route::get('/kelas/{kelas}/quiz/{quiz}', [MahasiswaController::class, 'quizDetail']);
                Route::post('/kelas/{kelas}/quiz/{quiz}/submit', [MahasiswaController::class, 'submitQuiz']);

                // Nilai & Absensi
                Route::get('/nilai', [MahasiswaController::class, 'nilai']);
                Route::get('/absensi', [MahasiswaController::class, 'absensi']);

                // Chat
                Route::get('/kelas/{kelas}/chat', [MahasiswaController::class, 'chatIndex']);
                Route::post('/kelas/{kelas}/chat', [MahasiswaController::class, 'chatSend']);
            });
    });
});
