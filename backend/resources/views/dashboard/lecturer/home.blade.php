@extends('layouts.dashboard')

@section('title', 'Dashboard Dosen')

@section('content')
<div class="container-fluid">
    <div class="mb-4">
        <h3 class="fw-bold text-dark mb-1">Beranda Dosen</h3>
        <p class="text-muted">Selamat datang kembali! Berikut ringkasan aktivitas akademik Anda.</p>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card card-widget border-0 shadow-sm p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="text-muted d-block mb-1">Mata Kuliah Diampu</span>
                        <h2 class="fw-bold mb-0">{{ $subjects->count() }}</h2>
                    </div>
                    <div class="widget-icon bg-primary bg-opacity-10 text-primary border-0">
                        <i class="fa-solid fa-book"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card card-widget border-0 shadow-sm p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="text-muted d-block mb-1">Total Mahasiswa</span>
                        <h2 class="fw-bold mb-0">{{ $totalStudents }}</h2>
                    </div>
                    <div class="widget-icon bg-success bg-opacity-10 text-success border-0">
                        <i class="fa-solid fa-users"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card card-widget border-0 shadow-sm p-4 text-white bg-primary">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="text-white-50 d-block mb-1">Agenda Hari Ini</span>
                        <h2 class="fw-bold mb-0">2 Sesi</h2>
                    </div>
                    <div class="widget-icon bg-white bg-opacity-20 border-0">
                        <i class="fa-solid fa-calendar-day text-white"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom-0 pt-4 px-4">
                    <h5 class="fw-bold mb-0">Daftar Mata Kuliah</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light bg-opacity-50">
                                <tr>
                                    <th class="ps-4 border-0">Mata Kuliah</th>
                                    <th class="text-center border-0">SKS</th>
                                    <th class="text-center border-0">Semester</th>
                                    <th class="text-center border-0">Jumlah Mahasiswa</th>
                                    <th class="text-center border-0 pe-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($subjects as $subject)
                                    <tr>
                                        <td class="ps-4">
                                            <span class="fw-bold d-block">{{ $subject->name }}</span>
                                            <span class="text-muted small">{{ $subject->code ?? 'MK-00' . $subject->id }}</span>
                                        </td>
                                        <td class="text-center">{{ $subject->sks }}</td>
                                        <td class="text-center">Semester {{ $subject->semester }}</td>
                                        <td class="text-center">{{ $subject->enrollments->count() }}</td>
                                        <td class="text-center pe-4">
                                            <div class="btn-group">
                                                <a href="{{ route('attendance.index') }}" class="btn btn-sm btn-outline-primary rounded-pill px-3 me-2">Absensi</a>
                                                <a href="{{ route('grade.index') }}" class="btn btn-sm btn-primary rounded-pill px-3">Input Nilai</a>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
