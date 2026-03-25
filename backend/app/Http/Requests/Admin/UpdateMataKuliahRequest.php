<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMataKuliahRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $mataKuliahId = $this->route('mata_kuliah') ? $this->route('mata_kuliah')->id : null;

        return [
            'prodi_id'  => ['sometimes', 'exists:prodi,id'],
            'kode'      => ['sometimes', 'string', 'unique:mata_kuliah,kode,' . $mataKuliahId],
            'nama'      => ['sometimes', 'string'],
            'sks'       => ['sometimes', 'integer', 'min:1', 'max:6'],
            'semester'  => ['sometimes', 'integer', 'min:1', 'max:14'],
            'deskripsi' => ['nullable', 'string'],
        ];
    }
}
