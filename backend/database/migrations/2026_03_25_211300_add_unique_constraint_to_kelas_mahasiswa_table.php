<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Remove duplicates before adding unique constraint
        // (Keep the lowest ID for each mahasiswa_id + kelas_id combination)
        DB::statement('
            DELETE t1 FROM kelas_mahasiswa t1
            INNER JOIN kelas_mahasiswa t2 
            WHERE 
                t1.id > t2.id AND 
                t1.kelas_id = t2.kelas_id AND 
                t1.mahasiswa_id = t2.mahasiswa_id
        ');

        // 2. Add the unique constraint
        Schema::table('kelas_mahasiswa', function (Blueprint $table) {
            $table->unique(['kelas_id', 'mahasiswa_id'], 'kelas_mahasiswa_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kelas_mahasiswa', function (Blueprint $table) {
            $table->dropUnique('kelas_mahasiswa_unique');
        });
    }
};
