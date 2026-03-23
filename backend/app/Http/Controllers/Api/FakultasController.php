<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FakultasService;
use Illuminate\Http\Request;

class FakultasController extends Controller
{
    protected $fakultasService;

    public function __construct(FakultasService $fakultasService)
    {
        $this->fakultasService = $fakultasService;
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => $this->fakultasService->getAll()
        ]);
    }

    public function store(Request $request)
    {
        $fakultas = $this->fakultasService->create($request->all());
        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil dibuat',
            'data' => $fakultas
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->fakultasService->getById($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $fakultas = $this->fakultasService->update($id, $request->all());
        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil diupdate',
            'data' => $fakultas
        ]);
    }

    public function destroy($id)
    {
        $this->fakultasService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil dihapus'
        ]);
    }
}
