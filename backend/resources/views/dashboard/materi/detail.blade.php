@extends('layouts.dashboard')

@section('title', 'Materi - ' . $subject->name)

@section('content')
<div class="container-fluid">
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('materi.index') }}">Materi</a></li>
            <li class="breadcrumb-item active">{{ $subject->name }}</li>
        </ol>
    </nav>

    <div class="mb-4 d-flex justify-content-between align-items-center">
        <div>
            <h3 class="fw-bold text-dark mb-1">{{ $subject->name }}</h3>
            <p class="text-muted">Materi pembelajaran per pertemuan.</p>
        </div>
        <div class="bg-white px-3 py-2 rounded shadow-sm border">
            <span class="fw-bold text-primary">{{ $subject->lecturer->user->name ?? 'Dosen' }}</span>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-12">
            @forelse($materials as $meeting => $meetingMaterials)
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom-0 pt-4 px-4">
                        <h5 class="fw-bold mb-0">Pertemuan {{ $meeting }}</h5>
                    </div>
                    <div class="card-body px-4 pb-4">
                        <div class="list-group list-group-flush">
                            @foreach($meetingMaterials as $material)
                                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 rounded-3 mb-2 bg-light bg-opacity-50">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-white p-2 rounded shadow-sm me-3">
                                            <i class="fa-solid fa-file-lines text-primary"></i>
                                        </div>
                                        <div>
                                            <span class="fw-medium d-block">{{ $material->title }}</span>
                                            <span class="text-muted x-small">{{ date('d M Y', strtotime($material->created_at)) }}</span>
                                        </div>
                                    </div>
                                    <a href="{{ asset('storage/' . $material->file_path) }}" class="btn btn-sm btn-primary rounded-pill px-3" target="_blank">
                                        <i class="fa-solid fa-download me-2"></i>Download
                                    </a>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            @empty
                <div class="alert alert-info text-center py-5">
                    <i class="fa-solid fa-folder-open fs-1 mb-3"></i>
                    <p class="mb-0">Belum ada materi untuk mata kuliah ini.</p>
                </div>
            @endforelse
        </div>
    </div>
</div>

<style>
    .x-small { font-size: 0.75rem; }
</style>
@endsection
