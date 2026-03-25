<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProdiRequest;
use App\Http\Requests\Admin\UpdateProdiRequest;
use App\Services\ProdiService;
use Illuminate\Http\Request;

class ProdiController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    protected $prodiService;

    public function __construct(ProdiService $prodiService)
    {
        $this->prodiService = $prodiService;
    }

    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->prodiService->getAll($request->only('fakultas_id'))
        ]);
    }

    public function store(StoreProdiRequest $request)
    {
        $prodi = $this->prodiService->create($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Prodi berhasil dibuat',
            'data' => $prodi
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->prodiService->getById($id)
        ]);
    }

    public function update(UpdateProdiRequest $request, $id)
    {
        $prodi = $this->prodiService->update($id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Prodi berhasil diupdate',
            'data' => $prodi
        ]);
    }

    public function destroy($id)
    {
        $this->prodiService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Prodi berhasil dihapus'
        ]);
    }
}
