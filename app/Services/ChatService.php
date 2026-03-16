<?php

namespace App\Services;

use App\Models\ChatMessage;

class ChatService
{
    /**
     * Save a chat message.
     */
    public function saveMessage(int $userId, string $room, string $message)
    {
        return ChatMessage::create([
            'user_id' => $userId,
            'room' => $room,
            'message' => $message,
        ]);
    }

    /**
     * Get chat history for a room.
     */
    public function getRoomHistory(string $room)
    {
        return ChatMessage::where('room', $room)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
