<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginSlide;
use App\Services\LoginSlideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginSlideController extends Controller
{
    public function __construct(private LoginSlideService $service) {}

    public function index(): JsonResponse
    {
        $result = $this->service->getActiveSlides();
        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'] ?? null,
            'data'    => $result['data'] ?? $result
        ], $result['success'] ? 200 : 500);
    }

    public function adminIndex(): JsonResponse
    {
        $result = $this->service->getAllSlides();
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text'   => 'required|string',
            'author' => 'required|string',
            'sub'    => 'nullable|string',
            'image'  => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'active' => 'required',
            'order'  => 'required|integer',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $result = $this->service->create($data);
        return response()->json($result, $result['success'] ? 201 : 500);
    }

    public function update(Request $request, LoginSlide $loginSlide): JsonResponse
    {
        $data = $request->validate([
            'text'   => 'sometimes|string',
            'author' => 'sometimes|string',
            'sub'    => 'nullable|string',
            'image'  => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'active' => 'sometimes',
            'order'  => 'sometimes|integer',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $result = $this->service->update($loginSlide, $data);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function destroy(LoginSlide $loginSlide): JsonResponse
    {
        $result = $this->service->delete($loginSlide);
        return response()->json($result, $result['success'] ? 200 : 500);
    }
}
