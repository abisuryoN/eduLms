<?php

namespace App\Services;

use App\Models\Materi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MateriService
{
    /**
     * Create materi (file upload, link, or video).
     */
    public function create(array $data, ?UploadedFile $file = null): Materi
    {
        if ($file && $data['tipe'] === 'file') {
            $path = $file->store('materi', 'public');
            $data['file_path'] = $path;
        }

        return Materi::create($data);
    }

    /**
     * Update materi.
     */
    public function update(Materi $materi, array $data, ?UploadedFile $file = null): Materi
    {
        if ($file && ($data['tipe'] ?? $materi->tipe) === 'file') {
            // Delete old file
            if ($materi->file_path) {
                Storage::disk('public')->delete($materi->file_path);
            }
            $path = $file->store('materi', 'public');
            $data['file_path'] = $path;
        }

        $materi->update($data);
        return $materi->fresh();
    }

    /**
     * Delete materi and its file.
     */
    public function delete(Materi $materi): void
    {
        if ($materi->file_path) {
            Storage::disk('public')->delete($materi->file_path);
        }
        $materi->delete();
    }

    /**
     * Get materi list for a kelas, ordered by pertemuan.
     */
    public function getByKelas(int $kelasId): \Illuminate\Database\Eloquent\Collection
    {
        return Materi::where('kelas_id', $kelasId)
            ->orderBy('pertemuan')
            ->get();
    }
}
