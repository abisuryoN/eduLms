<?php

namespace App\Services;

use App\Models\MataKuliah;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class MataKuliahService
{
    public function getAll(array $filters = [])
    {
        $query = MataKuliah::with('prodi.fakultas');
        if (isset($filters['prodi_id'])) {
            $query->where('prodi_id', $filters['prodi_id']);
        }
        if (isset($filters['semester'])) {
            $query->where('semester', $filters['semester']);
        }
        return $query->get();
    }

    public function getById($id)
    {
        return MataKuliah::with('prodi.fakultas')->findOrFail($id);
    }

    public function create(array $data)
    {
        $this->validate($data);
        return MataKuliah::create($data);
    }

    public function update($id, array $data)
    {
        $mataKuliah = MataKuliah::findOrFail($id);
        
        $rules = [
            'prodi_id' => 'required|exists:prodi,id',
            'kode' => 'required|string|max:20|unique:mata_kuliah,kode,' . $id,
            'nama' => 'required|string|max:255',
            'sks' => 'required|integer|min:1',
            'semester' => 'required|integer|min:1|max:8',
            'deskripsi' => 'nullable|string',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $mataKuliah->update($data);
        return $mataKuliah;
    }

    public function delete($id)
    {
        $mataKuliah = MataKuliah::findOrFail($id);
        return $mataKuliah->delete();
    }

    private function validate(array $data)
    {
        $rules = [
            'prodi_id' => 'required|exists:prodi,id',
            'kode' => 'required|string|max:20|unique:mata_kuliah,kode',
            'nama' => 'required|string|max:255',
            'sks' => 'required|integer|min:1',
            'semester' => 'required|integer|min:1|max:8',
            'deskripsi' => 'nullable|string',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
