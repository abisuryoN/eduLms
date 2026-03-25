<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignPengajarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'dosen_id'       => ['required', 'exists:dosen,id'],
            'mata_kuliah_id' => ['required', 'exists:mata_kuliah,id'],
            'kelas_ids'      => ['required', 'array'],
            'kelas_ids.*'    => ['exists:kelas,id'],
        ];
    }
}
