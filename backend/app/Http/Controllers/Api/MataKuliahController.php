<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MataKuliahService;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    protected $mataKuliahService;

    public function __construct(MataKuliahService $mataKuliahService)
    {
        $this->mataKuliahService = $mataKuliahService;
    }

    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->mataKuliahService->getAll($request->only(['prodi_id', 'semester']))
        ]);
    }

    public function store(Request $request)
    {
        $mataKuliah = $this->mataKuliahService->create($request->all());
        return response()->json([
            'success' => true,
            'message' => 'Mata Kuliah berhasil dibuat',
            'data' => $mataKuliah
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->mataKuliahService->getById($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $mataKuliah = $this->mataKuliahService->update($id, $request->all());
        return response()->json([
            'success' => true,
            'message' => 'Mata Kuliah berhasil diupdate',
            'data' => $mataKuliah
        ]);
    }

    public function destroy($id)
    {
        $this->mataKuliahService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Mata Kuliah berhasil dihapus'
        ]);
    }
}
