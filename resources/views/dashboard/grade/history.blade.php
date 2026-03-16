@extends('layouts.dashboard')

@section('title', 'Riwayat Nilai')

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Riwayat Nilai Akademik</h4>
    </div>
</div>

<div class="row g-4">
    <div class="col-12">
        <div class="card card-widget p-4">
            <h5 class="fw-bold mb-4">Kumulatif Nilai</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Semester</th>
                            <th>Mata Kuliah</th>
                            <th class="text-center">Tugas</th>
                            <th class="text-center">UTS</th>
                            <th class="text-center">UAS</th>
                            <th class="text-center">Akhir</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $currentSemester = null; @endphp
                        @forelse($grades as $grade)
                        @php 
                            $avg = ($grade->tugas + $grade->uts + $grade->uas) / 3;
                            $semester = $grade->subject->semester;
                        @endphp
                        @if($currentSemester !== $semester)
                            <tr class="table-light">
                                <td colspan="6" class="fw-bold text-primary">Semester {{ $semester }}</td>
                            </tr>
                            @php $currentSemester = $semester; @endphp
                        @endif
                        <tr>
                            <td>{{ $semester }}</td>
                            <td>
                                <div class="fw-bold">{{ $grade->subject->name }}</div>
                                <div class="small text-muted">{{ $grade->subject->code }}</div>
                            </td>
                            <td class="text-center">{{ $grade->tugas }}</td>
                            <td class="text-center">{{ $grade->uts }}</td>
                            <td class="text-center">{{ $grade->uas }}</td>
                            <td class="text-center">
                                <span class="badge {{ $avg >= 75 ? 'bg-success' : 'bg-warning' }} px-3 py-2 rounded-pill">
                                    {{ number_format($avg, 1) }}
                                </span>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-5 text-muted">Belum ada riwayat nilai ditemukan.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
