<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MahasiswaImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImportMahasiswaController extends Controller
{
    public function __construct(private MahasiswaImportService $service) {}

    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        $result = $this->service->preview($request->file('file'));

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        $result = $this->service->import($request->file('file'));

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}
