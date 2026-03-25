<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKelasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fakultas_id'    => 'nullable|exists:fakultas,id',
            'prodi_id'       => 'nullable|exists:prodi,id',
            'mata_kuliah_id' => 'nullable|exists:mata_kuliah,id',
            'dosen_id'       => 'nullable|exists:dosen,id',
            'dosen_pa_id'    => 'nullable|exists:dosen,id',
            'nama_kelas'     => 'required|string|max:10',
            'semester'       => 'required|string',
            'tahun_ajaran'   => 'required|string',
            'kategori_kelas' => 'required|in:Regular Pagi,Regular Sore,Regular Malam',
        ];
    }
}
