<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateKelasRequest extends FormRequest
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
            'mata_kuliah_id' => 'sometimes|exists:mata_kuliah,id',
            'dosen_id'       => 'sometimes|exists:dosen,id',
            'dosen_pa_id'    => 'nullable|exists:dosen,id',
            'nama_kelas'     => 'sometimes|string|max:10',
            'semester'       => 'sometimes|string',
            'tahun_ajaran'   => 'sometimes|string',
        ];
    }
}
