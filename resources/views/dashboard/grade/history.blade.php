@extends('layouts.dashboard')

@section('title', 'Riwayat Nilai Akademik')

@section('content')
<div class="container-fluid">
    <div class="mb-4 d-flex justify-content-between align-items-center">
        <div>
            <h3 class="fw-bold text-dark mb-1">Riwayat Nilai Akademik</h3>
            <p class="text-muted">Pantau pencapaian akademik Anda per semester.</p>
        </div>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="card card-widget border-0 shadow-sm bg-primary text-white p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="x-small text-white-50 d-block mb-1">IPK (Indeks Prestasi Kumulatif)</span>
                        <h2 class="fw-bold mb-0">{{ number_format($ipk, 2) }}</h2>
                    </div>
                    <div class="widget-icon bg-white bg-opacity-20 border-0">
                        <i class="fa-solid fa-chart-line text-white"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card card-widget border-0 shadow-sm p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="x-small text-muted d-block mb-1">IPS (Semester Ini)</span>
                        <h2 class="fw-bold mb-0">{{ number_format($ipsData[Auth::user()->student->semester] ?? 0, 2) }}</h2>
                    </div>
                    <div class="widget-icon bg-success bg-opacity-10 border-0">
                        <i class="fa-solid fa-graduation-cap text-success"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-12">
            @forelse($gradesGrouped as $semester => $semesterGrades)
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold mb-0">Semester {{ $semester }}</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">IPS: {{ number_format($ipsData[$semester], 2) }}</span>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light bg-opacity-50">
                                    <tr>
                                        <th class="ps-4 border-0">Mata Kuliah</th>
                                        <th class="text-center border-0">SKS</th>
                                        <th class="text-center border-0">Tugas</th>
                                        <th class="text-center border-0">UTS</th>
                                        <th class="text-center border-0">UAS</th>
                                        <th class="text-center border-0">Akhir</th>
                                        <th class="text-center border-0 pe-4">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($semesterGrades as $grade)
                                        @php
                                            $final = ($grade->tugas * 0.3) + ($grade->uts * 0.3) + ($grade->uas * 0.4);
                                            $letter = 'E';
                                            $color = 'danger';
                                            if ($final >= 80) { $letter = 'A'; $color = 'success'; }
                                            elseif ($final >= 70) { $letter = 'B'; $color = 'primary'; }
                                            elseif ($final >= 60) { $letter = 'C'; $color = 'info'; }
                                            elseif ($final >= 50) { $letter = 'D'; $color = 'warning'; }
                                        @endphp
                                        <tr>
                                            <td class="ps-4">
                                                <span class="fw-semibold d-block">{{ $grade->subject->name }}</span>
                                                <span class="text-muted small">Dosen: {{ $grade->subject->lecturer->user->name ?? '-' }}</span>
                                            </td>
                                            <td class="text-center">{{ $grade->subject->sks }}</td>
                                            <td class="text-center">{{ $grade->tugas }}</td>
                                            <td class="text-center">{{ $grade->uts }}</td>
                                            <td class="text-center">{{ $grade->uas }}</td>
                                            <td class="text-center">
                                                <span class="fw-bold text-dark">{{ round($final, 1) }}</span>
                                            </td>
                                            <td class="text-center pe-4">
                                                <span class="badge bg-{{ $color }} bg-opacity-10 text-{{ $color }} fs-6">{{ $letter }}</span>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            @empty
                <div class="card border-0 shadow-sm p-5 text-center">
                    <div class="mb-3">
                        <i class="fa-solid fa-receipt fs-1 text-muted"></i>
                    </div>
                    <h5>Belum ada data nilai</h5>
                    <p class="text-muted">Nilai akademik Anda akan tampil di sini setelah diinput oleh dosen.</p>
                </div>
            @endforelse
        </div>
    </div>
</div>

<style>
    .x-small { font-size: 0.75rem; }
</style>
@endsection
