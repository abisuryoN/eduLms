<?php

namespace App\Http\Controllers;

use App\Services\ChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function __construct(protected ChatService $chatService) {}

    public function showRoom(string $room = null)
    {
        $user = Auth::user();
        
        // If no room specified, default to student's class-semester
        if (!$room && $user->student) {
            $room = $user->student->kelas . '-Semester-' . $user->student->semester;
        }

        if (!$room) {
            return back()->with('error', 'Ruang chat tidak ditemukan.');
        }

        $messages = $this->chatService->getRoomHistory($room);
        return view('dashboard.chat.show', compact('messages', 'room'));
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'room' => 'required|string'
        ]);

        $this->chatService->saveMessage(Auth::id(), $request->room, $request->message);

        // In a real app, we would broadcast the event here
        // event(new \App\Events\ChatMessageSent(Auth::user(), $request->message, $request->room));

        return response()->json(['status' => 'success']);
    }
}
