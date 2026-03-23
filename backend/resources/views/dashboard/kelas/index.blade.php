@extends('layouts.dashboard')

@section('title', 'Informasi Kelas')

@section('content')
<div class="container-fluid">
    <div class="row g-4">
        <!-- Class Info Card -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4 text-center">
                    <div class="widget-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3" style="width: 70px; height: 70px; font-size: 1.5rem;">
                        <i class="fa-solid fa-school"></i>
                    </div>
                    <h4 class="fw-bold mb-1">{{ $student->kelas }}</h4>
                    <p class="text-muted small mb-4">Program Studi Teknik Informatika</p>
                    
                    <div class="row g-2">
                        <div class="col-6 text-start">
                            <span class="x-small text-muted d-block">Semester</span>
                            <span class="fw-bold text-dark">{{ $student->semester }}</span>
                        </div>
                        <div class="col-6 text-end">
                            <span class="x-small text-muted d-block">Total Teman</span>
                            <span class="fw-bold text-dark">{{ $classmates->count() }} Orang</span>
                        </div>
                    </div>
                    <hr class="my-3 opacity-50">
                    <div class="d-grid gap-2">
                        <a href="{{ route('chat.show') }}" class="btn btn-primary rounded-pill">
                            <i class="fa-solid fa-comments me-2"></i>Buka Chat Kelas
                        </a>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom-0 pt-4 px-4">
                    <h6 class="fw-bold mb-0">Mata Kuliah Semester Ini</h6>
                </div>
                <div class="card-body px-4 pb-4">
                    <div class="list-group list-group-flush small">
                        @foreach($subjects as $sbj)
                            <div class="list-group-item px-0 py-2 border-0 d-flex justify-content-between">
                                <span class="text-secondary">{{ $sbj->name }}</span>
                                <span class="fw-bold">{{ $sbj->sks }} SKS</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        <!-- Classmates List -->
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom-0 pt-4 px-4">
                    <h5 class="fw-bold mb-0">Daftar Mahasiswa Kelas {{ $student->kelas }}</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light bg-opacity-50 x-small text-uppercase">
                                <tr>
                                    <th class="ps-4 border-0">Mahasiswa</th>
                                    <th class="border-0">NIM</th>
                                    <th class="border-0">Status</th>
                                    <th class="text-end border-0 pe-4">Profil</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($classmates as $mate)
                                    <tr>
                                        <td class="ps-4">
                                            <div class="d-flex align-items-center">
                                                @php
                                                    $mateAvatar = 'https://ui-avatars.com/api/?name='.urlencode($mate->user->name);
                                                    if ($mate->foto) {
                                                        $mateAvatar = (str_starts_with($mate->foto, 'http')) ? $mate->foto : asset('storage/' . $mate->foto);
                                                    }
                                                @endphp
                                                <img src="{{ $mateAvatar }}" class="rounded-circle me-3" width="40" height="40" alt="">
                                                <div>
                                                    <span class="fw-bold d-block {{ $mate->id == $student->id ? 'text-primary' : '' }}">
                                                        {{ $mate->user->name }}
                                                        @if($mate->id == $student->id) (Anda) @endif
                                                    </span>
                                                    <span class="text-muted x-small">Mahasiswa Aktif</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{{ $mate->nim }}</td>
                                        <td>
                                            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 x-small">Aktif</span>
                                        </td>
                                        <td class="text-end pe-4">
                                            <button class="btn btn-sm btn-light rounded-circle"><i class="fa-solid fa-eye text-primary"></i></button>
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

<style>
    .x-small { font-size: 0.75rem; }
</style>
@endsection
