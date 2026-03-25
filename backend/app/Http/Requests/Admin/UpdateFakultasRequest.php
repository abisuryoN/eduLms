<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFakultasRequest extends FormRequest
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
        $fakultasId = $this->route('fakulta') ? $this->route('fakulta')->id : null;

        return [
            'kode'      => ['sometimes', 'string', 'unique:fakultas,kode,' . $fakultasId],
            'nama'      => ['sometimes', 'string'],
            'deskripsi' => ['nullable', 'string'],
        ];
    }
}
