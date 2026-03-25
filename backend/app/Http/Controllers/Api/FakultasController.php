<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFakultasRequest;
use App\Http\Requests\Admin\UpdateFakultasRequest;
use App\Services\FakultasService;
use Illuminate\Http\Request;

class FakultasController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

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

    public function store(StoreFakultasRequest $request)
    {
        $fakultas = $this->fakultasService->create($request->validated());
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

    public function update(UpdateFakultasRequest $request, $id)
    {
        $fakultas = $this->fakultasService->update($id, $request->validated());
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
