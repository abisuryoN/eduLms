<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Users ────────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('username')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'dosen', 'mahasiswa']);
            $table->string('avatar')->nullable();
            $table->boolean('is_first_login')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index('role');
        });

        // ── 2. Fakultas ─────────────────────────────────
        Schema::create('fakultas', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 10)->unique();
            $table->string('nama');
            $table->timestamps();
        });

        // ── 3. Prodi ────────────────────────────────────
        Schema::create('prodi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fakultas_id')->constrained('fakultas')->cascadeOnDelete();
            $table->string('kode', 10)->unique();
            $table->string('nama');
            $table->string('jenjang', 5)->default('S1'); // S1, S2, S3
            $table->timestamps();

            $table->index('fakultas_id');
        });

        // ── 4. Mahasiswa ────────────────────────────────
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('prodi_id')->constrained('prodi')->cascadeOnDelete();
            $table->string('nim', 20)->unique();
            $table->date('tanggal_lahir');
            $table->date('tanggal_masuk');
            $table->string('tempat_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->string('alamat')->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('prodi_id');
        });

        // ── 5. Dosen ────────────────────────────────────
        Schema::create('dosen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('id_kerja', 30)->unique();
            $table->date('tanggal_lahir');
            $table->string('no_hp', 20)->nullable();
            $table->string('alamat')->nullable();
            $table->string('keahlian')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });

        // ── 6. Mata Kuliah ──────────────────────────────
        Schema::create('mata_kuliah', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();
            $table->string('nama');
            $table->unsignedTinyInteger('sks')->default(2);
            $table->unsignedTinyInteger('semester')->default(1);
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        // ── 7. Kelas ────────────────────────────────────
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->foreignId('dosen_id')->constrained('dosen')->cascadeOnDelete();
            $table->string('nama_kelas', 10); // A, B, C
            $table->string('semester', 10);
            $table->string('tahun_ajaran', 20); // 2024/2025
            $table->timestamps();

            $table->index('dosen_id');
            $table->index('mata_kuliah_id');
        });

        // ── 8. Kelas Mahasiswa (pivot) ──────────────────
        Schema::create('kelas_mahasiswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['kelas_id', 'mahasiswa_id']);
        });

        // ── 9. Jadwal ───────────────────────────────────
        Schema::create('jadwal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->string('gedung', 50)->nullable();
            $table->string('ruangan', 50)->nullable();
            $table->timestamps();

            $table->index('kelas_id');
        });

        // ── 10. Materi ──────────────────────────────────
        Schema::create('materi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->unsignedTinyInteger('pertemuan'); // 1-16
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('tipe', ['file', 'link', 'video']);
            $table->string('file_path')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();

            $table->index('kelas_id');
        });

        // ── 11. Absensi ─────────────────────────────────
        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
            $table->unsignedTinyInteger('pertemuan'); // 1-16
            $table->enum('status', ['hadir', 'izin', 'alpha']);
            $table->date('tanggal');
            $table->timestamps();

            $table->unique(['kelas_id', 'mahasiswa_id', 'pertemuan']);
        });

        // ── 12. Nilai ───────────────────────────────────
        Schema::create('nilai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
            $table->decimal('tugas', 5, 2)->default(0);
            $table->decimal('uts', 5, 2)->default(0);
            $table->decimal('uas', 5, 2)->default(0);
            $table->decimal('total', 5, 2)->default(0);
            $table->string('grade', 2)->nullable(); // A, A-, B+, B, ...
            $table->timestamps();

            $table->unique(['kelas_id', 'mahasiswa_id']);
        });

        // ── 13. Quiz ────────────────────────────────────
        Schema::create('quiz', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->unsignedInteger('durasi_menit')->default(30);
            $table->unsignedTinyInteger('pertemuan')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index('kelas_id');
        });

        // ── 14. Soal ────────────────────────────────────
        Schema::create('soal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quiz')->cascadeOnDelete();
            $table->text('pertanyaan');
            $table->string('opsi_a');
            $table->string('opsi_b');
            $table->string('opsi_c');
            $table->string('opsi_d');
            $table->enum('jawaban_benar', ['a', 'b', 'c', 'd']);
            $table->unsignedInteger('poin')->default(1);
            $table->timestamps();

            $table->index('quiz_id');
        });

        // ── 15. Jawaban Mahasiswa ───────────────────────
        Schema::create('jawaban_mahasiswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quiz')->cascadeOnDelete();
            $table->foreignId('soal_id')->constrained('soal')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
            $table->enum('jawaban', ['a', 'b', 'c', 'd'])->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('poin')->default(0);
            $table->timestamps();

            $table->unique(['soal_id', 'mahasiswa_id']);
        });

        // ── 16. Notifikasi ──────────────────────────────
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('kelas_id')->nullable()->constrained('kelas')->nullOnDelete();
            $table->string('judul');
            $table->text('pesan');
            $table->boolean('is_read')->default(false);
            $table->string('tipe', 30)->default('info');
            $table->timestamps();

            $table->index('user_id');
        });

        // ── 17. Chat ────────────────────────────────────
        Schema::create('chat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('pesan');
            $table->timestamps();

            $table->index(['kelas_id', 'created_at']);
        });

        // ── Sessions & Personal Access Tokens ───────────
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        $tables = [
            'sessions', 'personal_access_tokens', 'chat', 'notifikasi',
            'jawaban_mahasiswa', 'soal', 'quiz', 'nilai', 'absensi',
            'materi', 'jadwal', 'kelas_mahasiswa', 'kelas', 'mata_kuliah',
            'dosen', 'mahasiswa', 'prodi', 'fakultas', 'users',
        ];
        foreach ($tables as $t) {
            Schema::dropIfExists($t);
        }
    }
};
