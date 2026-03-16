@extends('layouts.dashboard')

@section('title', 'Daftar Mata Kuliah')

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Mata Kuliah Saya</h4>
    </div>
</div>

<div class="row g-4">
    @forelse($subjects as $subject)
    <div class="col-md-4">
        <div class="card card-widget h-100">
            <div class="card-body p-4">
                <div class="widget-icon mb-3">
                    <i class="fa-solid fa-book"></i>
                </div>
                <h5 class="fw-bold mb-1">{{ $subject->name }}</h5>
                <p class="text-muted small mb-3">{{ $subject->code }}</p>
                <div class="d-flex align-items-center mb-3">
                    <img src="https://ui-avatars.com/api/?name={{ urlencode($subject->lecturer->user->name ?? 'Dosen') }}&background=random" class="rounded-circle me-2" width="30" height="30">
                    <span class="small text-dark">{{ $subject->lecturer->user->name ?? 'Nama Dosen' }}</span>
                </div>
                <a href="{{ route('kelas.show', $subject->id) }}" class="btn btn-outline-primary w-100 rounded-pill">Lihat Materi</a>
            </div>
        </div>
    </div>
    @empty
    <div class="col-12 text-center py-5">
        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" width="120" class="mb-3 opacity-50">
        <p class="text-muted">Anda belum terdaftar di mata kuliah apapun.</p>
    </div>
    @endforelse
</div>
@endsection
