<?php

namespace App\Services;

use App\Models\Fakultas;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class FakultasService
{
    public function getAll()
    {
        return Fakultas::all();
    }

    public function getById($id)
    {
        return Fakultas::findOrFail($id);
    }

    public function create(array $data)
    {
        $this->validate($data);
        return Fakultas::create($data);
    }

    public function update($id, array $data)
    {
        $fakultas = Fakultas::findOrFail($id);
        
        $rules = [
            'kode' => 'required|string|max:10|unique:fakultas,kode,' . $id,
            'nama' => 'required|string|max:255',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $fakultas->update($data);
        return $fakultas;
    }

    public function delete($id)
    {
        $fakultas = Fakultas::findOrFail($id);
        return $fakultas->delete();
    }

    private function validate(array $data)
    {
        $rules = [
            'kode' => 'required|string|max:10|unique:fakultas,kode',
            'nama' => 'required|string|max:255',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
