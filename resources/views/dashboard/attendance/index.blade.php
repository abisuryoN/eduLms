@extends('layouts.dashboard')

@section('title', 'Presensi Kuliah')

@section('content')
<div class="row">
    <div class="col-md-6 mx-auto">
        <div class="card card-widget p-4">
            <h4 class="fw-bold mb-4 text-center">Buka Sesi Presensi</h4>
            <form action="{{ route('attendance.checklist') }}" method="GET">
                <div class="mb-3">
                    <label class="form-label fw-semibold">Pilih Mata Kuliah</label>
                    <select name="subject_id" class="form-select" required>
                        @foreach($subjects as $sub)
                            <option value="{{ $sub->id }}">{{ $sub->name }} ({{ $sub->code }})</option>
                        @endforeach
                    </select>
                </div>
                <div class="mb-4">
                    <label class="form-label fw-semibold">Pilih Kelas</label>
                    <select name="class_id" class="form-select" required>
                        @foreach($classes as $cls)
                            <option value="{{ $cls->id }}">{{ $cls->name }} - Semester {{ $cls->semester }}</option>
                        @endforeach
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-100 btn-lg rounded-pill">Tampilkan Daftar Mahasiswa</button>
            </form>
        </div>
    </div>
</div>
@endsection
