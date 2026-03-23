<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ProfileService
{
    /**
     * Update user profile data.
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update(array_filter([
            'name'  => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
        ]));

        // Update related profile data
        if ($user->isMahasiswa() && $user->mahasiswa) {
            $user->mahasiswa->update(array_filter([
                'tempat_lahir'  => $data['tempat_lahir'] ?? null,
                'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                'alamat'        => $data['alamat'] ?? null,
                'no_hp'         => $data['no_hp'] ?? null,
            ]));
        }

        if ($user->isDosen() && $user->dosen) {
            $user->dosen->update(array_filter([
                'no_hp'    => $data['no_hp'] ?? null,
                'alamat'   => $data['alamat'] ?? null,
                'keahlian' => $data['keahlian'] ?? null,
            ]));
        }

        return $user->fresh();
    }

    /**
     * Upload and compress profile photo.
     * - Format: jpg/png
     * - Max: 2MB (validated in controller)
     * - Resize: 300x300
     * - Quality: 70%
     */
    public function uploadPhoto(User $user, UploadedFile $file): string
    {
        // Delete old photo
        $this->deleteOldPhoto($user);

        $filename = 'profile_' . $user->id . '_' . time() . '.jpg';
        $path     = 'uploads/profile/' . $filename;

        // Compress with Intervention Image
        $image = Image::read($file->getRealPath());
        $image->cover(300, 300);

        $fullPath = public_path($path);
        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $image->toJpeg(70)->save($fullPath);

        // Update user avatar
        $user->update(['avatar' => $filename]);

        return $filename;
    }

    /**
     * Delete old profile photo.
     */
    private function deleteOldPhoto(User $user): void
    {
        if ($user->avatar) {
            $oldPath = public_path('uploads/profile/' . $user->avatar);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }
    }
}
