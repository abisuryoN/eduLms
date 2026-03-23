@extends('layouts.dashboard')

@section('title', 'Tugas - ' . $subject->name)

@section('content')
<div class="container-fluid">
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('tugas.index') }}">Tugas</a></li>
            <li class="breadcrumb-item active">{{ $subject->name }}</li>
        </ol>
    </nav>

    <div class="mb-4">
        <h3 class="fw-bold text-dark mb-1">{{ $subject->name }}</h3>
        <p class="text-muted">Daftar penugasan dan pengumpulan tugas.</p>
    </div>

    <div class="row">
        <div class="col-lg-12">
            @forelse($assignments as $assignment)
                @php
                    $submission = $assignment->submissions()
                        ->where('student_id', Auth::user()->student->id)
                        ->first();
                @endphp
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="fw-bold mb-1">{{ $assignment->title }}</h5>
                                <p class="text-muted mb-3">{{ $assignment->description }}</p>
                                <div class="d-flex align-items-center gap-4 small">
                                    <span class="text-muted">
                                        <i class="fa-solid fa-calendar text-primary me-2"></i>Tenggat: {{ date('d M Y, H:i', strtotime($assignment->due_date)) }}
                                    </span>
                                    @if($submission)
                                        <span class="text-success fw-bold">
                                            <i class="fa-solid fa-circle-check me-2"></i>Sudah Dikumpulkan
                                        </span>
                                    @else
                                        <span class="text-danger fw-bold">
                                            <i class="fa-solid fa-circle-xmark me-2"></i>Belum Dikumpulkan
                                        </span>
                                    @endif
                                </div>
                            </div>
                            <div class="col-md-4 mt-3 mt-md-0 text-md-end">
                                @if(!$submission)
                                    <button class="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#submitModal{{ $assignment->id }}">
                                        Kumpulkan Tugas
                                    </button>
                                @else
                                    <div class="bg-light p-2 rounded-3 d-inline-block text-start">
                                        <span class="small d-block text-muted">Nilai Anda</span>
                                        <span class="fw-bold fs-4 text-primary">{{ $submission->grade ?? '-' }}</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Submission Modal -->
                @if(!$submission)
                <div class="modal fade" id="submitModal{{ $assignment->id }}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content border-0 shadow">
                            <form action="{{ route('tugas.submit') }}" method="POST" enctype="multipart/form-data">
                                @csrf
                                <input type="hidden" name="assignment_id" value="{{ $assignment->id }}">
                                <div class="modal-header border-0 pb-0">
                                    <h5 class="modal-title fw-bold">Kumpulkan Tugas</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body p-4">
                                    <p class="text-muted mb-4">Kumpulkan jawaban tugas <strong>{{ $assignment->title }}</strong> dalam format PDF atau ZIP.</p>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">File Tugas</label>
                                        <input type="file" name="file" class="form-control" required>
                                        <small class="text-muted">Maksimal 10MB.</small>
                                    </div>
                                </div>
                                <div class="modal-footer border-0 pt-0">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                    <button type="submit" class="btn btn-primary px-4">Kirim Tugas</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                @endif
            @empty
                <div class="alert alert-info text-center py-5">
                    <i class="fa-solid fa-tasks fs-1 mb-3"></i>
                    <p class="mb-0">Belum ada tugas untuk mata kuliah ini.</p>
                </div>
            @endforelse
        </div>
    </div>
</div>
@endsection
