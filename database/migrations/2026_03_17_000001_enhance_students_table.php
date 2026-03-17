<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('nik')->nullable()->after('nim');
            $table->string('npwp')->nullable()->after('nik');
            $table->string('tempat_lahir')->nullable()->after('tanggal_lahir');
            $table->string('agama')->nullable()->after('tempat_lahir');
            $table->string('kewarganegaraan')->nullable()->after('agama');
            $table->string('no_telp')->nullable()->after('kewarganegaraan');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable()->after('no_telp');
            $table->string('status_perkawinan')->nullable()->after('jenis_kelamin');
            $table->string('golongan_darah')->nullable()->after('status_perkawinan');
            $table->integer('berat_badan')->nullable()->after('golongan_darah');
            $table->integer('tinggi_badan')->nullable()->after('berat_badan');
            $table->string('ukuran_baju')->nullable()->after('tinggi_badan');
            
            // Additional Tabs Context
            $table->text('alamat_lengkap')->nullable();
            $table->string('nama_ayah')->nullable();
            $table->string('nama_ibu')->nullable();
            $table->string('nama_wali')->nullable();
            $table->string('no_telp_ortu')->nullable();
            $table->string('sekolah_asal')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'nik', 'npwp', 'tempat_lahir', 'agama', 'kewarganegaraan', 'no_telp', 
                'jenis_kelamin', 'status_perkawinan', 'golongan_darah', 'berat_badan', 
                'tinggi_badan', 'ukuran_baju', 'alamat_lengkap', 'nama_ayah', 
                'nama_ibu', 'nama_wali', 'no_telp_ortu', 'sekolah_asal'
            ]);
        });
    }
};
