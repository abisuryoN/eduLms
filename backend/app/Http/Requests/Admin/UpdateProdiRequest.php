<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProdiRequest extends FormRequest
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
        $prodiId = $this->route('prodi') ? $this->route('prodi')->id : null;

        return [
            'fakultas_id' => ['sometimes', 'exists:fakultas,id'],
            'kode'        => ['sometimes', 'string', 'unique:prodi,kode,' . $prodiId],
            'nama'        => ['sometimes', 'string'],
            'akreditasi'  => ['nullable', 'string', 'max:50'],
            'deskripsi'   => ['nullable', 'string'],
        ];
    }
}
