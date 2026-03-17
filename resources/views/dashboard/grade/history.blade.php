@extends('layouts.dashboard')

@section('title', 'Riwayat Nilai & Transkrip')

@section('content')
<div class="container-fluid">
    <div class="row g-4">
        <!-- Semester Selector & Stats -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h5 class="fw-bold mb-4">Ringkasan Akademik</h5>
                    <div class="d-flex align-items-center mb-4">
                        <div class="widget-icon bg-primary bg-opacity-10 text-primary me-3">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <span class="text-muted small d-block">IPK Kumulatif</span>
                            <h3 class="fw-bold mb-0 text-primary">{{ number_format($ipk, 2) }}</h3>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label small fw-bold text-muted text-uppercase">Pilih Semester</label>
                        <select class="form-select border-0 bg-light rounded-3" id="semesterFilter">
                            @foreach($gradesGrouped as $sem => $grades)
                                <option value="sem-{{ $sem }}" {{ $sem == Auth::user()->student->semester ? 'selected' : '' }}>Semester {{ $sem }}</option>
                            @endforeach
                            <option value="transcript">Seluruh Semester (Transkrip)</option>
                        </select>
                    </div>

                    <div class="d-grid">
                        <button class="btn btn-outline-primary rounded-pill" onclick="showTranscript()">
                            <i class="fa-solid fa-file-invoice me-2"></i>Lihat Transkrip Lengkap
                        </button>
                    </div>
                </div>
            </div>

            <!-- GPA Chart Card -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
                    <h6 class="fw-bold mb-0">Grafik Perkembangan IPS</h6>
                </div>
                <div class="card-body p-4">
                    <canvas id="ipsChart" height="200"></canvas>
                </div>
            </div>
        </div>

        <!-- Grade List -->
        <div class="col-lg-8">
            <div id="gradesContainer">
                @foreach($gradesGrouped as $sem => $grades)
                    <div class="semester-section" id="sem-{{ $sem }}" style="{{ $sem == Auth::user()->student->semester ? '' : 'display:none;' }}">
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                                <h5 class="fw-bold mb-0">Detail Nilai Semester {{ $sem }}</h5>
                                <div class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                                    IPS: {{ number_format($ipsData[$sem] ?? 0, 2) }}
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="bg-light bg-opacity-50 small text-uppercase fw-bold">
                                            <tr>
                                                <th class="ps-4">Mata Kuliah</th>
                                                <th class="text-center">SKS</th>
                                                <th class="text-center">Tugas</th>
                                                <th class="text-center">UTS</th>
                                                <th class="text-center">UAS</th>
                                                <th class="text-center">Akhir</th>
                                                <th class="text-center pe-4">Huruf</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($grades as $grade)
                                                @php
                                                    $akhir = ($grade->tugas * 0.3) + ($grade->uts * 0.3) + ($grade->uas * 0.4);
                                                    $huruf = 'E';
                                                    $color = 'text-danger';
                                                    if($akhir >= 80) { $huruf = 'A'; $color = 'text-success'; }
                                                    elseif($akhir >= 70) { $huruf = 'B'; $color = 'text-primary'; }
                                                    elseif($akhir >= 60) { $huruf = 'C'; $color = 'text-warning'; }
                                                    elseif($akhir >= 50) { $huruf = 'D'; $color = 'text-secondary'; }
                                                @endphp
                                                <tr>
                                                    <td class="ps-4">
                                                        <span class="fw-bold d-block">{{ $grade->subject->name }}</span>
                                                        <span class="text-muted x-small">Dosen: {{ $grade->subject->lecturer->user->name }}</span>
                                                    </td>
                                                    <td class="text-center">{{ $grade->subject->sks }}</td>
                                                    <td class="text-center text-muted">{{ $grade->tugas }}</td>
                                                    <td class="text-center text-muted">{{ $grade->uts }}</td>
                                                    <td class="text-center text-muted">{{ $grade->uas }}</td>
                                                    <td class="text-center fw-bold">{{ number_format($akhir, 1) }}</td>
                                                    <td class="text-center pe-4">
                                                        <span class="fw-bold {{ $color }}">{{ $huruf }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach

                <!-- Transcript View (All Semesters) -->
                <div class="semester-section" id="sem-transcript" style="display:none;">
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-white border-bottom py-3 px-4">
                            <h5 class="fw-bold mb-0">Transkrip Nilai Keseluruhan (Semester 1 - {{ Auth::user()->student->semester }})</h5>
                        </div>
                        <div class="card-body p-0">
                            @foreach($gradesGrouped as $sem => $grades)
                                <div class="px-4 py-2 bg-light border-bottom small fw-bold text-muted">SEMESTER {{ $sem }}</div>
                                <div class="table-responsive">
                                    <table class="table table-sm align-middle mb-0">
                                        <tbody>
                                            @foreach($grades as $grade)
                                                @php
                                                    $akhir = ($grade->tugas * 0.3) + ($grade->uts * 0.3) + ($grade->uas * 0.4);
                                                    $huruf = 'E';
                                                    if($akhir >= 80) $huruf = 'A';
                                                    elseif($akhir >= 70) $huruf = 'B';
                                                    elseif($akhir >= 60) $huruf = 'C';
                                                    elseif($akhir >= 50) $huruf = 'D';
                                                @endphp
                                                <tr class="small">
                                                    <td class="ps-4 w-50">{{ $grade->subject->name }}</td>
                                                    <td class="text-center">{{ $grade->subject->sks }} SKS</td>
                                                    <td class="text-center fw-bold pe-4 w-25">Indeks: {{ $huruf }} ({{ number_format($akhir, 1) }})</td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('ipsChart').getContext('2d');
        const trendData = @json(array_values($trendData));
        const labels = @json(array_keys($trendData));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(l => 'Sem ' + l),
                datasets: [{
                    label: 'IPS',
                    data: trendData,
                    borderColor: '#2a5298',
                    backgroundColor: 'rgba(42, 82, 152, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#2a5298',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4.0,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        // Semester Filter Logic
        document.getElementById('semesterFilter').addEventListener('change', function() {
            const val = this.value;
            document.querySelectorAll('.semester-section').forEach(el => {
                el.style.display = 'none';
            });
            
            if(val === 'transcript') {
                document.getElementById('sem-transcript').style.display = 'block';
            } else {
                document.getElementById(val).style.display = 'block';
            }
        });
    });

    function showTranscript() {
        const filter = document.getElementById('semesterFilter');
        filter.value = 'transcript';
        filter.dispatchEvent(new Event('change'));
    }
</script>
<style>
    .x-small { font-size: 0.75rem; }
    .widget-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }
</style>
@endpush
@endsection
