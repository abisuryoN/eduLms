<?php

namespace App\Services;

use App\Models\Prodi;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProdiService
{
    public function getAll(array $filters = [])
    {
        $query = Prodi::with('fakultas');
        if (isset($filters['fakultas_id'])) {
            $query->where('fakultas_id', $filters['fakultas_id']);
        }
        return $query->get();
    }

    public function getById($id)
    {
        return Prodi::with('fakultas')->findOrFail($id);
    }

    public function create(array $data)
    {
        $this->validate($data);
        return Prodi::create($data);
    }

    public function update($id, array $data)
    {
        $prodi = Prodi::findOrFail($id);
        
        $rules = [
            'fakultas_id' => 'required|exists:fakultas,id',
            'kode' => 'required|string|max:10|unique:prodi,kode,' . $id,
            'nama' => 'required|string|max:255',
            'jenjang' => 'nullable|string|max:5',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $prodi->update($data);
        return $prodi;
    }

    public function delete($id)
    {
        $prodi = Prodi::findOrFail($id);
        return $prodi->delete();
    }

    private function validate(array $data)
    {
        $rules = [
            'fakultas_id' => 'required|exists:fakultas,id',
            'kode' => 'required|string|max:10|unique:prodi,kode',
            'nama' => 'required|string|max:255',
            'jenjang' => 'nullable|string|max:5',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
