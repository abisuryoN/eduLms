<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMataKuliahRequest;
use App\Http\Requests\Admin\UpdateMataKuliahRequest;
use App\Services\MataKuliahService;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

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

    public function store(StoreMataKuliahRequest $request)
    {
        $mataKuliah = $this->mataKuliahService->create($request->validated());
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

    public function update(UpdateMataKuliahRequest $request, $id)
    {
        $mataKuliah = $this->mataKuliahService->update($id, $request->validated());
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
