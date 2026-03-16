@extends('layouts.dashboard')

@section('title', 'Chat Kelas')

@push('styles')
<style>
    .chat-container { height: calc(100vh - 250px); display: flex; flex-direction: column; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .chat-header { padding: 15px 20px; border-bottom: 1px solid #eee; background: #fafafa; border-radius: 12px 12px 0 0; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
    .chat-input { padding: 15px 20px; border-top: 1px solid #eee; }
    .message { max-width: 75%; padding: 10px 15px; border-radius: 15px; position: relative; }
    .message.received { align-self: flex-start; background: #f0f2f5; color: #333; border-bottom-left-radius: 2px; }
    .message.sent { align-self: flex-end; background: #2a5298; color: white; border-bottom-right-radius: 2px; }
    .message-meta { font-size: 0.75rem; margin-top: 5px; opacity: 0.7; }
</style>
@endpush

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Ruang Chat: {{ $room }}</h4>
        
        <div class="chat-container">
            <div class="chat-header d-flex align-items-center">
                <i class="fa-solid fa-circle text-success me-2" style="font-size: 0.6rem;"></i>
                <span class="fw-semibold">Diskusi Kelas</span>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                @forelse($messages as $msg)
                <div class="message {{ $msg->user_id == Auth::id() ? 'sent' : 'received' }}">
                    @if($msg->user_id != Auth::id())
                        <div class="fw-bold small mb-1">{{ $msg->user->name }}</div>
                    @endif
                    <div class="message-content">{{ $msg->message }}</div>
                    <div class="message-meta">{{ $msg->created_at->format('H:i') }}</div>
                </div>
                @empty
                <div class="text-center text-muted my-auto">
                    <p>Mulai percakapan di sini...</p>
                </div>
                @endforelse
            </div>
            
            <div class="chat-input">
                <form id="chatForm" class="d-flex gap-2">
                    <input type="text" id="messageInput" class="form-control" placeholder="Tulis pesan..." required autocomplete="off">
                    <button type="submit" class="btn btn-primary px-4">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    document.getElementById('chatForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (!message) return;

        // Optimistic UI update
        const msgHtml = `
            <div class="message sent">
                <div class="message-content">${message}</div>
                <div class="message-meta">Just now</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', msgHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        input.value = '';

        // API Call
        fetch("{{ route('chat.send') }}", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({
                message: message,
                room: "{{ $room }}"
            })
        });
    });
</script>
@endpush
