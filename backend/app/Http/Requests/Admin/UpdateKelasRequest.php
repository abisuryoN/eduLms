<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'fakultas_id'       => ['sometimes', 'exists:fakultas,id'],
            'prodi_id'          => ['sometimes', 'exists:prodi,id'],
            'nama_kelas'        => ['sometimes', 'string', 'max:100'],
            'semester'          => ['sometimes', 'integer', 'min:1', 'max:14'],
            'tahun_ajaran'      => ['sometimes', 'string', 'max:20'],
            'kategori_kelas'    => ['sometimes', 'in:Reguler Pagi,Reguler Sore,Karyawan'],
            'dosen_id'          => ['nullable', 'exists:dosen,id'],
            'mata_kuliah_id'    => ['nullable', 'exists:mata_kuliah,id'],
        ];
    }
}
