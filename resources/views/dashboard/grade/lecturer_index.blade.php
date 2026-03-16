@extends('layouts.dashboard')

@section('title', 'Input Nilai')

@section('content')
<div class="row">
    <div class="col-md-6 mx-auto">
        <div class="card card-widget p-4">
            <h4 class="fw-bold mb-4 text-center">Pilih Mata Kuliah</h4>
            <form action="{{ route('grade.input') }}" method="GET">
                <div class="mb-4">
                    <label class="form-label fw-semibold">Mata Kuliah</label>
                    <select name="subject_id" class="form-select" required>
                        @foreach($subjects as $sub)
                            <option value="{{ $sub->id }}">{{ $sub->name }} ({{ $sub->code }})</option>
                        @endforeach
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-100 btn-lg rounded-pill">Input Nilai Mahasiswa</button>
            </form>
        </div>
    </div>
</div>
@endsection
