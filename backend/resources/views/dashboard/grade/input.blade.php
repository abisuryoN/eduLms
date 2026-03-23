@extends('layouts.dashboard')

@section('title', 'Form Nilai')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card card-widget p-4">
            <h4 class="fw-bold mb-4">Input Nilai: {{ $subject->name }}</h4>
            
            <form action="{{ route('grade.submit') }}" method="POST">
                @csrf
                <input type="hidden" name="subject_id" value="{{ $subject->id }}">
                
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="bg-light">
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Tugas</th>
                                <th>UTS</th>
                                <th>UAS</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($students as $student)
                            @php $grade = $student->grades()->where('subject_id', $subject->id)->first(); @endphp
                            <tr>
                                <td>
                                    <div class="fw-bold">{{ $student->user->name }}</div>
                                    <div class="small text-muted">{{ $student->nim }}</div>
                                </td>
                                <td><input type="number" name="grades[{{ $student->id }}][tugas]" class="form-control" value="{{ $grade->tugas ?? 0 }}" min="0" max="100"></td>
                                <td><input type="number" name="grades[{{ $student->id }}][uts]" class="form-control" value="{{ $grade->uts ?? 0 }}" min="0" max="100"></td>
                                <td><input type="number" name="grades[{{ $student->id }}][uas]" class="form-control" value="{{ $grade->uas ?? 0 }}" min="0" max="100"></td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-4">
                    <button type="submit" class="btn btn-success btn-lg px-5 rounded-pill">Simpan Semua Nilai</button>
                    <a href="{{ route('grade.index') }}" class="btn btn-link text-muted ms-3">Batal</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
