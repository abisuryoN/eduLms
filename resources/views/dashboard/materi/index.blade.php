@extends('layouts.dashboard')

@section('title', 'Materi Kuliah')

@section('content')
<div class="container-fluid">
    <div class="mb-4">
        <h3 class="fw-bold text-dark mb-1">Materi Kuliah</h3>
        <p class="text-muted">Pilih mata kuliah untuk melihat materi per pertemuan.</p>
    </div>

    <div class="row g-4">
        @forelse($subjects as $subject)
            <div class="col-md-6 col-lg-4">
                <a href="{{ route('materi.detail', $subject->id) }}" class="text-decoration-none">
                    <div class="card card-widget h-100 border-0 shadow-sm hover-lift">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="widget-icon me-3">
                                    <i class="fa-solid fa-file-pdf"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold text-dark mb-0">{{ $subject->name }}</h5>
                                    <span class="text-muted small">Semester {{ $subject->semester }}</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-4">
                                <span class="text-muted small">Klik untuk lihat materi</span>
                                <i class="fa-solid fa-chevron-right text-muted small"></i>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        @empty
            <div class="col-12">
                <div class="alert alert-info text-center">Belum ada mata kuliah.</div>
            </div>
        @endforelse
    </div>
</div>

<style>
    .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
    .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
</style>
@endsection
