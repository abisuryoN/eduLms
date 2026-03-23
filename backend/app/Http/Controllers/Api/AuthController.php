<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class AuthController extends Controller
{
    public function __construct(private AuthService $service) {}

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            return response()->json($this->service->login($credentials));
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->service->logout($request->user());
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->service->formatUser($request->user())]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        try {
            $this->service->changePassword($request->user(), $data);
            return response()->json(['message' => 'Password berhasil diubah.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
}
