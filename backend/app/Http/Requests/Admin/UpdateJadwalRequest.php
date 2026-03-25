<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJadwalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'kelas_id'    => ['sometimes', 'exists:kelas,id'],
            'hari'        => ['sometimes', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai'   => ['sometimes', 'date_format:H:i'],
            'jam_selesai' => ['sometimes', 'date_format:H:i', 'after:jam_mulai'],
            'gedung'      => ['nullable', 'string', 'max:50'],
            'lantai'      => ['nullable', 'string', 'max:50'],
            'ruangan'     => ['nullable', 'string', 'max:50'],
        ];
    }
}
