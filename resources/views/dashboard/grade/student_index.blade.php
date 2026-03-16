@extends('layouts.dashboard')

@section('title', 'Nilai Saya')

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Transkrip Nilai Semester Ini</h4>
    </div>
</div>

<div class="row g-4">
    <div class="col-md-8">
        <div class="card card-widget p-4">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Mata Kuliah</th>
                            <th class="text-center">Tugas</th>
                            <th class="text-center">UTS</th>
                            <th class="text-center">UAS</th>
                            <th class="text-center">Akhir</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($grades as $grade)
                        @php $avg = ($grade->tugas + $grade->uts + $grade->uas) / 3; @endphp
                        <tr>
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
                            <td colspan="5" class="text-center py-5 text-muted">Belum ada nilai yang diinput.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card card-widget p-4 text-center">
            <h5 class="fw-bold mb-3">Rangkuman Akademik</h5>
            <div class="display-4 fw-bold text-primary mb-1">A</div>
            <p class="text-muted">Status: Sangat Memuaskan</p>
            <hr>
            <div class="row">
                <div class="col-6">
                    <div class="small text-muted">IPK</div>
                    <div class="fw-bold">3.75</div>
                </div>
                <div class="col-6">
                    <div class="small text-muted">SKS Lulus</div>
                    <div class="fw-bold">120</div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
