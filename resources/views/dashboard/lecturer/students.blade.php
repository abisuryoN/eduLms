@extends('layouts.dashboard')

@section('title', 'Daftar Mahasiswa')

@section('content')
<div class="container-fluid">
    <div class="mb-4">
        <h3 class="fw-bold text-dark mb-1">Manajemen Mahasiswa</h3>
        <p class="text-muted">Daftar seluruh mahasiswa yang mengambil mata kuliah Anda.</p>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light bg-opacity-50">
                        <tr>
                            <th class="ps-4 border-0">Mahasiswa</th>
                            <th class="border-0">NIM</th>
                            <th class="border-0">Kelas</th>
                            <th class="border-0">Email</th>
                            <th class="text-center border-0 pe-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($students as $student)
                            <tr>
                                <td class="ps-4">
                                    <div class="d-flex align-items-center">
                                        <img src="{{ $student->foto ? asset('storage/' . $student->foto) : asset('img/default-avatar.png') }}" 
                                            class="rounded-circle me-3" width="40" height="40" alt="">
                                        <div>
                                            <span class="fw-bold d-block">{{ $student->user->name }}</span>
                                            <span class="text-muted small">Semester {{ $student->semester }}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ $student->nim }}</td>
                                <td>
                                    <span class="badge bg-primary bg-opacity-10 text-primary px-3">{{ $student->kelas }}</span>
                                </td>
                                <td>{{ $student->user->email }}</td>
                                <td class="text-center pe-4">
                                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3">Detail Profil</button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
