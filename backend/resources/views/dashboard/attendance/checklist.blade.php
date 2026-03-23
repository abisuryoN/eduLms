@extends('layouts.dashboard')

@section('title', 'Checklist Presensi')

@section('content')
<div class="row">
    <div class="col-md-8 mx-auto">
        <div class="card card-widget p-4">
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h4 class="fw-bold mb-0">Checklist Presensi</h4>
                <span class="badge bg-primary px-3 py-2 rounded-pill">{{ now()->format('d M Y') }}</span>
            </div>
            
            <form action="{{ route('attendance.submit') }}" method="POST">
                @csrf
                <input type="hidden" name="class_id" value="{{ $class_id }}">
                <input type="hidden" name="subject_id" value="{{ $subject_id }}">
                
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th width="10%">No</th>
                                <th width="60%">Nama Mahasiswa / NIM</th>
                                <th width="30%" class="text-center">Hadir</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($students as $index => $student)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>
                                    <div class="fw-bold">{{ $student->user->name }}</div>
                                    <div class="small text-muted">{{ $student->nim }}</div>
                                </td>
                                <td class="text-center">
                                    <div class="form-check form-switch d-inline-block">
                                        <input class="form-check-input" type="checkbox" name="attendance[{{ $student->id }}]" value="1" checked style="width: 3em; height: 1.5em; cursor: pointer;">
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="3" class="text-center py-4">Tidak ada mahasiswa terdaftar di kelas ini.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                
                <div class="d-grid mt-4">
                    <button type="submit" class="btn btn-success btn-lg rounded-pill" {{ count($students) == 0 ? 'disabled' : '' }}>Simpan Presensi</button>
                    <a href="{{ route('attendance.index') }}" class="btn btn-link text-muted mt-2">Batal</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
