<?php

namespace App\Services;

use App\Models\LoginSlide;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Exception;

class LoginSlideService
{
    public function getActiveSlides(): array
    {
        try {
            $slides = LoginSlide::where('active', true)
                ->orderBy('order')
                ->orderByDesc('id')
                ->get();

            return ['success' => true, 'data' => $slides];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal mengambil data slide: ' . $e->getMessage()];
        }
    }

    public function getAllSlides(): array
    {
        try {
            $slides = LoginSlide::orderBy('order')
                ->orderByDesc('id')
                ->get();

            return ['success' => true, 'data' => $slides];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal mengambil data slide: ' . $e->getMessage()];
        }
    }

    public function create(array $data): array
    {
        try {
            $slide = DB::transaction(function () use ($data) {
                if (isset($data['image'])) {
                    $data['image'] = $data['image']->store('slides', 'public');
                }
                return LoginSlide::create($data);
            });

            return ['success' => true, 'data' => $slide, 'message' => 'Slide berhasil dibuat.'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal membuat slide: ' . $e->getMessage()];
        }
    }

    public function update(LoginSlide $slide, array $data): array
    {
        try {
            $slide = DB::transaction(function () use ($slide, $data) {
                if (isset($data['image'])) {
                    if ($slide->image) {
                        Storage::disk('public')->delete($slide->image);
                    }
                    $data['image'] = $data['image']->store('slides', 'public');
                }
                $slide->update($data);
                return $slide->fresh();
            });

            return ['success' => true, 'data' => $slide, 'message' => 'Slide berhasil diperbarui.'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal memperbarui slide: ' . $e->getMessage()];
        }
    }

    public function delete(LoginSlide $slide): array
    {
        try {
            DB::transaction(function () use ($slide) {
                if ($slide->image) {
                    Storage::disk('public')->delete($slide->image);
                }
                $slide->delete();
            });

            return ['success' => true, 'message' => 'Slide berhasil dihapus.'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Gagal menghapus slide: ' . $e->getMessage()];
        }
    }
}
