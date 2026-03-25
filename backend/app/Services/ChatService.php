<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\Kelas;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ChatService
{
    public function __construct(
        private NotifikasiService $notifikasiService,
    ) {}

    /**
     * Get paginated chat messages for a kelas.
     */
    public function getMessages(int $kelasId, int $perPage = 50): LengthAwarePaginator
    {
        return Chat::withTrashed()
            ->where('kelas_id', $kelasId)
            ->with('user:id,name,avatar,role')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Get new messages since a given ID (for polling).
     */
    public function getNewMessages(int $kelasId, int $afterId): \Illuminate\Database\Eloquent\Collection
    {
        return Chat::withTrashed()
            ->where('kelas_id', $kelasId)
            ->where('id', '>', $afterId)
            ->with('user:id,name,avatar,role')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Send a new message.
     */
    public function sendMessage(int $kelasId, int $userId, string $pesan): Chat
    {
        $chat = Chat::create([
            'kelas_id' => $kelasId,
            'user_id'  => $userId,
            'pesan'    => $pesan,
        ]);

        $this->sendChatNotification($chat);

        return $chat->load('user:id,name,avatar,role');
    }

    /**
     * Edit a message (ownership + 1-hour check).
     */
    public function editMessage(int $chatId, int $userId, string $newPesan): Chat
    {
        $chat = Chat::findOrFail($chatId);

        if (!$chat->isEditable($userId)) {
            abort(403, 'Anda tidak bisa mengedit pesan ini.');
        }

        $chat->update([
            'pesan'     => $newPesan,
            'edited_at' => now(),
        ]);

        return $chat->load('user:id,name,avatar,role');
    }

    /**
     * Soft-delete a message (ownership check).
     */
    public function deleteMessage(int $chatId, int $userId): bool
    {
        $chat = Chat::findOrFail($chatId);

        if (!$chat->isDeletable($userId)) {
            abort(403, 'Anda tidak bisa menghapus pesan ini.');
        }

        return $chat->delete();
    }

    /**
     * Get kelas info for the chat header.
     */
    public function getKelasInfo(int $kelasId): array
    {
        $kelas = Kelas::with([
            'prodi.fakultas',
            'pembimbingAkademik.dosen.user:id,name',
            'mahasiswa:id,user_id,nim',
            'mahasiswa.user:id,name,avatar',
        ])
        ->select('id', 'nama_kelas', 'semester', 'tahun_ajaran', 'prodi_id', 'fakultas_id')
        ->findOrFail($kelasId);

        $dosenPA = $kelas->pembimbingAkademik->first();

        return [
            'id'            => $kelas->id,
            'nama_kelas'    => $kelas->nama_kelas,
            'semester'      => $kelas->semester,
            'tahun_ajaran'  => $kelas->tahun_ajaran,
            'prodi'         => $kelas->prodi?->nama,
            'fakultas'      => $kelas->prodi?->fakultas?->nama,
            'dosen_pa'      => $dosenPA?->dosen?->user?->name,
            'mahasiswa'     => $kelas->mahasiswa->map(fn($m) => [
                'id'     => $m->id,
                'nim'    => $m->nim,
                'nama'   => $m->user?->name,
                'avatar' => $m->user?->avatar,
            ]),
            'total_mahasiswa' => $kelas->mahasiswa->count(),
        ];
    }

    /**
     * Send notification to all kelas members about new chat message.
     */
    private function sendChatNotification(Chat $chat): void
    {
        $kelas = Kelas::with([
            'prodi.fakultas',
            'pembimbingAkademik.dosen',
            'mahasiswa',
        ])->find($chat->kelas_id);

        if (!$kelas) return;

        $sender = User::find($chat->user_id);
        $preview = mb_substr($chat->pesan, 0, 100);
        $judul = "Pesan baru dari Kelas {$kelas->nama_kelas}";
        $pesan = "{$sender->name}: {$preview}";

        $data = [
            'kelas'           => $kelas->nama_kelas,
            'fakultas'        => $kelas->prodi?->fakultas?->nama,
            'prodi'           => $kelas->prodi?->nama,
            'semester'        => $kelas->semester,
            'sender'          => $sender->name,
            'sender_role'     => $sender->role,
            'message_preview' => $preview,
            'kelas_id'        => $kelas->id,
        ];

        // Collect all user IDs to notify (exclude sender)
        $recipientIds = collect();

        // Admin users
        $recipientIds = $recipientIds->merge(User::where('role', 'admin')->pluck('id'));

        // Dosen PA
        foreach ($kelas->pembimbingAkademik as $pa) {
            if ($pa->dosen) {
                $recipientIds->push($pa->dosen->user_id);
            }
        }

        // Mahasiswa
        foreach ($kelas->mahasiswa as $mhs) {
            $recipientIds->push($mhs->user_id);
        }

        // Remove sender and duplicates
        $recipientIds = $recipientIds->unique()->reject(fn($id) => $id === $chat->user_id);

        // Batch insert notifications
        $now = now();
        $notifications = $recipientIds->map(fn($uid) => [
            'user_id'    => $uid,
            'kelas_id'   => $kelas->id,
            'judul'      => $judul,
            'pesan'      => $pesan,
            'tipe'       => 'chat',
            'data'       => json_encode($data),
            'is_read'    => false,
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();

        foreach (array_chunk($notifications, 500) as $chunk) {
            DB::table('notifikasi')->insert($chunk);
        }
    }
}
