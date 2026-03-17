@extends('layouts.dashboard')

@section('title', 'Presensi Saya')

@section('content')
<div class="container-fluid">
    <div class="mb-4">
        <h3 class="fw-bold text-dark mb-1">Presensi Saya</h3>
        <p class="text-muted">Pantau tingkat kehadiran Anda pada setiap mata kuliah (Min. 75%).</p>
    </div>

    <div class="row">
        @forelse($attendanceData as $item)
            <div class="col-md-6 col-lg-4">
                <div class="card card-widget border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="fw-bold text-dark mb-0">{{ $item->subject_name }}</h6>
                            <span class="badge bg-{{ $item->percentage >= 75 ? 'success' : 'danger' }} bg-opacity-10 text-{{ $item->percentage >= 75 ? 'success' : 'danger' }} rounded-pill px-3">
                                {{ $item->percentage }}%
                            </span>
                        </div>
                        
                        <div class="progress mb-3" style="height: 10px; border-radius: 5px;">
                            <div class="progress-bar bg-{{ $item->percentage >= 75 ? 'primary' : 'warning' }}" role="progressbar" 
                                style="width: {{ $item->percentage }}%; border-radius: 5px;" 
                                aria-valuenow="{{ $item->percentage }}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center x-small text-muted">
                            <span>Kehadiran: <strong>{{ $item->attended }}</strong> / {{ $item->total }} Sesi</span>
                            @if($item->percentage < 75)
                                <span class="text-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i>Di bawah batas</span>
                            @else
                                <span class="text-success"><i class="fa-solid fa-check-circle me-1"></i>Aman</span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-12 text-center py-5">
                <div class="mb-3">
                    <i class="fa-solid fa-calendar-xmark fs-1 text-muted"></i>
                </div>
                <h5>Belum ada data presensi</h5>
                <p class="text-muted">Data presensi akan muncul setelah perkuliahan dimulai.</p>
            </div>
        @endforelse
    </div>
</div>

<style>
    .x-small { font-size: 0.75rem; }
    .progress-bar { transition: width 0.6s ease; }
</style>
@endsection
