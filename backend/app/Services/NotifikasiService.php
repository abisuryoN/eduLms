<?php

namespace App\Services;

use App\Models\Notifikasi;

class NotifikasiService
{
    /**
     * Kirim notifikasi ke user tertentu.
     */
    public function send(int $userId, string $judul, string $pesan, ?int $kelasId = null, string $tipe = 'info'): Notifikasi
    {
        return Notifikasi::create([
            'user_id'  => $userId,
            'kelas_id' => $kelasId,
            'judul'    => $judul,
            'pesan'    => $pesan,
            'tipe'     => $tipe,
        ]);
    }

    /**
     * Kirim notifikasi ke semua mahasiswa di kelas.
     */
    public function sendToKelas(int $kelasId, string $judul, string $pesan, string $tipe = 'info'): int
    {
        $kelas = \App\Models\Kelas::with('mahasiswa.user')->findOrFail($kelasId);
        $count = 0;

        foreach ($kelas->mahasiswa as $mhs) {
            $this->send($mhs->user_id, $judul, $pesan, $kelasId, $tipe);
            $count++;
        }

        return $count;
    }

    /**
     * Get notifikasi for a user.
     */
    public function getByUser(int $userId, bool $unreadOnly = false)
    {
        $query = Notifikasi::where('user_id', $userId)->orderByDesc('created_at');

        if ($unreadOnly) {
            $query->where('is_read', false);
        }

        return $query->paginate(20);
    }

    /**
     * Mark as read.
     */
    public function markAsRead(int $notifikasiId): void
    {
        Notifikasi::where('id', $notifikasiId)->update(['is_read' => true]);
    }

    /**
     * Mark all as read for a user.
     */
    public function markAllAsRead(int $userId): void
    {
        Notifikasi::where('user_id', $userId)->where('is_read', false)->update(['is_read' => true]);
    }
}
