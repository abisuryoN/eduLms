<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->string('file_path');
            $table->string('status')->default('submitted'); // submitted, graded
            $table->float('grade')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};
