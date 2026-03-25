<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'kelas_id'    => ['required', 'exists:kelas,id'],
            'hari'        => ['required', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai'   => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'gedung'      => ['nullable', 'string', 'max:50'],
            'lantai'      => ['nullable', 'string', 'max:50'],
            'ruangan'     => ['nullable', 'string', 'max:50'],
        ];
    }
}
