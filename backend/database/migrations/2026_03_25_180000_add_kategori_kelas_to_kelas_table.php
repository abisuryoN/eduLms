<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kelas', function (Blueprint $table) {
            $table->enum('kategori_kelas', ['Regular Pagi', 'Regular Sore', 'Regular Malam'])
                  ->default('Regular Pagi')
                  ->after('semester');
        });
    }

    public function down(): void
    {
        Schema::table('kelas', function (Blueprint $table) {
            $table->dropColumn('kategori_kelas');
        });
    }
};
