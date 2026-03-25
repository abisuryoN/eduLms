<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chat extends Model
{
    use SoftDeletes;

    protected $table = 'chat';

    protected $fillable = ['kelas_id', 'user_id', 'pesan', 'edited_at'];

    protected function casts(): array
    {
        return [
            'edited_at' => 'datetime',
        ];
    }

    /* ── Relationships ────────────────────────── */

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ── Business Rules ───────────────────────── */

    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Editable only by owner within 1 hour of creation.
     */
    public function isEditable(int $userId): bool
    {
        return $this->isOwnedBy($userId)
            && $this->created_at->diffInMinutes(now()) <= 60;
    }

    /**
     * Deletable only by owner.
     */
    public function isDeletable(int $userId): bool
    {
        return $this->isOwnedBy($userId);
    }
}
