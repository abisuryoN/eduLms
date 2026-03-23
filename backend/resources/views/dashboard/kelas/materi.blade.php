@extends('layouts.dashboard')

@section('title', 'Materi Kuliah')

@section('content')
<div class="row mb-4">
    <div class="col-12">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('kelas.index') }}">Mata Kuliah</a></li>
                <li class="breadcrumb-item active" aria-current="page">Materi</li>
            </ol>
        </nav>
        <h4 class="fw-bold">Materi Mata Kuliah</h4>
    </div>
</div>

<div class="row g-4">
    <div class="col-md-8">
        <div class="card card-widget p-4">
            <h5 class="fw-bold mb-4">Daftar Materi</h5>
            <div class="list-group list-group-flush">
                @forelse($materials as $material)
                <div class="list-group-item px-0 py-3 border-bottom d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="widget-icon me-3 bg-light text-primary" style="width: 40px; height: 40px; font-size: 1.2rem;">
                            <i class="fa-solid fa-file-pdf"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 fw-semibold">{{ $material->title }}</h6>
                            <small class="text-muted">{{ $material->description ?? 'Tidak ada deskripsi' }}</small>
                        </div>
                    </div>
                    <a href="{{ asset('storage/'.$material->file_path) }}" class="btn btn-sm btn-light border" target="_blank">
                        <i class="fa-solid fa-download me-1"></i> Unduh
                    </a>
                </div>
                @empty
                <div class="text-center py-5">
                    <p class="text-muted">Belum ada materi yang diunggah.</p>
                </div>
                @endforelse
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card card-widget p-4 mb-4">
            <h5 class="fw-bold mb-3">Informasi Kelas</h5>
            <p class="small text-muted mb-4">Gunakan ruang chat untuk berdiskusi dengan dosen dan teman sekelas.</p>
            <a href="#" class="btn btn-primary w-100 mb-2">
                <i class="fa-solid fa-comments me-2"></i> Ruang Chat
            </a>
            <a href="#" class="btn btn-outline-secondary w-100">
                <i class="fa-solid fa-calendar-check me-2"></i> Presensi Saya
            </a>
        </div>
    </div>
</div>
@endsection
