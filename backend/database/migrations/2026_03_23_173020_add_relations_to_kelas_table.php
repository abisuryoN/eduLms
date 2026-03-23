<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kelas', function (Blueprint $table) {
            $table->foreignId('dosen_pa_id')->nullable()->constrained('dosen')->nullOnDelete();
            $table->foreignId('prodi_id')->nullable()->constrained('prodi')->nullOnDelete();
            $table->foreignId('fakultas_id')->nullable()->constrained('fakultas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kelas', function (Blueprint $table) {
            $table->dropForeign(['dosen_pa_id']);
            $table->dropForeign(['prodi_id']);
            $table->dropForeign(['fakultas_id']);
            
            $table->dropColumn(['dosen_pa_id', 'prodi_id', 'fakultas_id']);
        });
    }
};
