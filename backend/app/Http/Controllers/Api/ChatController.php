<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private ChatService $chatService,
    ) {}

    /**
     * GET /kelas/{kelas}/info
     * Get kelas info for the chat header + sidebar.
     */
    public function kelasInfo(Kelas $kelas): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->chatService->getKelasInfo($kelas->id)
        ]);
    }

    /**
     * GET /kelas/{kelas}/chat
     * Paginated messages (supports polling via ?after_id=X).
     */
    public function index(Request $request, Kelas $kelas): JsonResponse
    {
        $afterId = $request->integer('after_id');

        if ($afterId) {
            return response()->json([
                'success' => true,
                'data'    => $this->chatService->getNewMessages($kelas->id, $afterId),
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->chatService->getMessages($kelas->id, $request->integer('per_page', 50))
        ]);
    }

    /**
     * POST /kelas/{kelas}/chat
     * Send a new message.
     */
    public function store(Request $request, Kelas $kelas): JsonResponse
    {
        $request->validate([
            'pesan' => 'required|string|max:5000',
        ]);

        $chat = $this->chatService->sendMessage(
            $kelas->id,
            auth()->id(),
            $request->pesan
        );

        return response()->json([
            'success' => true,
            'message' => 'Pesan terkirim.',
            'data'    => $chat
        ], 201);
    }

    /**
     * PUT /kelas/{kelas}/chat/{chat}
     * Edit own message (within 1 hour).
     */
    public function update(Request $request, Kelas $kelas, int $chatId): JsonResponse
    {
        $request->validate([
            'pesan' => 'required|string|max:5000',
        ]);

        $chat = $this->chatService->editMessage(
            $chatId,
            auth()->id(),
            $request->pesan
        );

        return response()->json([
            'success' => true,
            'message' => 'Pesan diperbarui.',
            'data'    => $chat
        ]);
    }

    /**
     * DELETE /kelas/{kelas}/chat/{chat}
     * Soft-delete own message.
     */
    public function destroy(Kelas $kelas, int $chatId): JsonResponse
    {
        $this->chatService->deleteMessage($chatId, auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Pesan telah dihapus.'
        ]);
    }

    /**
     * GET /class/{kelas}/members
     * Get all members of a kelas.
     */
    public function members(Kelas $kelas): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->chatService->getMembers($kelas->id)
        ]);
    }
}
