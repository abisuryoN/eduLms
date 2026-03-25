<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProdiRequest extends FormRequest
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
            'fakultas_id' => ['required', 'exists:fakultas,id'],
            'kode'        => ['required', 'string', 'unique:prodi,kode'],
            'nama'        => ['required', 'string'],
            'akreditasi'  => ['nullable', 'string', 'max:50'],
            'deskripsi'   => ['nullable', 'string'],
        ];
    }
}
