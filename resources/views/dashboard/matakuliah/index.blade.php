@extends('layouts.dashboard')

@section('title', 'Mata Kuliah Saya')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Mata Kuliah Saya</h3>
            <p class="text-muted">Daftar mata kuliah yang Anda tempuh pada semester ini.</p>
        </div>
        <div class="bg-white p-3 rounded-3 shadow-sm border">
            <span class="text-muted small d-block">Semester Aktif</span>
            <span class="fw-bold text-primary">{{ Auth::user()->student->semester ?? '-' }}</span>
        </div>
    </div>

    <div class="row g-4">
        @forelse($subjects as $subject)
            <div class="col-md-4">
                <div class="card card-widget h-100 border-0 shadow-sm overflow-hidden">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="widget-icon bg-primary bg-opacity-10 text-primary">
                                <i class="fa-solid fa-book-open"></i>
                            </div>
                            <span class="badge bg-info bg-opacity-10 text-info rounded-pill px-3">{{ $subject->sks }} SKS</span>
                        </div>
                        <h5 class="card-title fw-bold mb-1">{{ $subject->name }}</h5>
                        <p class="text-muted small mb-3">
                            <i class="fa-solid fa-user-tie me-2"></i>{{ $subject->lecturer->user->name ?? 'Dosen Belum Ditentukan' }}
                        </p>
                        <hr class="my-3 opacity-50">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Status: <span class="text-success fw-medium">Aktif</span></span>
                            <a href="{{ route('materi.detail', $subject->id) }}" class="btn btn-sm btn-outline-primary rounded-pill px-3">Lihat Materi</a>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-12">
                <div class="alert alert-info text-center py-5">
                    <i class="fa-solid fa-circle-info fs-1 mb-3"></i>
                    <p class="mb-0">Belum ada mata kuliah yang terdaftar.</p>
                </div>
            </div>
        @endforelse
    </div>
</div>
@endsection
