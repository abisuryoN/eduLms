<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMataKuliahRequest extends FormRequest
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
        return [
            'prodi_id'  => ['required', 'exists:prodi,id'],
            'kode'      => ['required', 'string', 'unique:mata_kuliah,kode'],
            'nama'      => ['required', 'string'],
            'sks'       => ['required', 'integer', 'min:1', 'max:6'],
            'semester'  => ['required', 'integer', 'min:1', 'max:14'],
            'deskripsi' => ['nullable', 'string'],
        ];
    }
}
