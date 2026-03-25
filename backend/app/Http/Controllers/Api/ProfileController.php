<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotifikasiService;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService    $profileService,
        private NotifikasiService $notifikasiService,
    ) {}

    /**
     * PUT /api/profile
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'email'         => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'tempat_lahir'  => 'nullable|string',
            'jenis_kelamin' => 'nullable|in:L,P',
            'alamat'        => 'nullable|string',
            'no_hp'         => 'nullable|string|max:20',
            'keahlian'      => 'nullable|string',
        ]);

        $user = $this->profileService->updateProfile($request->user(), $data);
        $user->load(['mahasiswa.prodi.fakultas', 'dosen']);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $user,
        ]);
    }

    /**
     * POST /api/profile/photo
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $filename = $this->profileService->uploadPhoto($request->user(), $request->file('photo'));

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diupload.',
            'data'    => [
                'avatar'  => url('uploads/profile/' . $filename),
            ]
        ]);
    }

    /**
     * GET /api/notifikasi
     */
    public function notifikasi(Request $request): JsonResponse
    {
        $unreadOnly = $request->boolean('unread_only', false);
        $data = $this->notifikasiService->getByUser($request->user()->id, $unreadOnly);

        return response()->json([
            'success' => true,
            'data'    => $data
        ]);
    }

    /**
     * POST /api/notifikasi/{id}/read
     */
    public function markNotifikasiRead(int $id): JsonResponse
    {
        $this->notifikasiService->markAsRead($id);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai sudah dibaca.'
        ]);
    }

    /**
     * POST /api/notifikasi/read-all
     */
    public function markAllNotifikasiRead(Request $request): JsonResponse
    {
        $this->notifikasiService->markAllAsRead($request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai sudah dibaca.'
        ]);
    }
}
