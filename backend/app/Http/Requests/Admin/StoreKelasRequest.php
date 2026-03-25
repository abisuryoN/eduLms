<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'fakultas_id'       => ['required', 'exists:fakultas,id'],
            'prodi_id'          => ['required', 'exists:prodi,id'],
            'nama_kelas'        => ['required', 'string', 'max:100'],
            'semester'          => ['required', 'integer', 'min:1', 'max:14'],
            'tahun_ajaran'      => ['required', 'string', 'max:20'],
            'kategori_kelas'    => ['required', 'in:Reguler Pagi,Reguler Sore,Karyawan'],
            'dosen_id'          => ['nullable', 'exists:dosen,id'],
            'mata_kuliah_id'    => ['nullable', 'exists:mata_kuliah,id'],
        ];
    }
}
