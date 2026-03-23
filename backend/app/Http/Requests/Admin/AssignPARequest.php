<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignPARequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dosen_id'    => 'required|exists:dosen,id',
            'kelas_ids'   => 'required|array|min:1',
            'kelas_ids.*' => 'exists:kelas,id',
        ];
    }
}
