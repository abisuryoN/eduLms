<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thesis_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('lecturer_id')->nullable()->constrained('lecturers')->onDelete('set null');
            $table->string('title');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->dateTime('submission_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thesis_submissions');
    }
};
