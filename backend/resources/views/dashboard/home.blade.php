@extends('layouts.dashboard')

@section('title', 'Dashboard')

@section('content')
<div class="row g-4 mb-4">
    <!-- IPK Card -->
    <div class="col-md-3">
        <div class="card card-widget p-3">
            <div class="d-flex align-items-center">
                <div class="widget-icon me-3">
                    <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">IPK</h6>
                    <h4 class="fw-bold mb-0">3.75</h4>
                </div>
            </div>
        </div>
    </div>
    <!-- Tagihan Card -->
    <div class="col-md-3">
        <div class="card card-widget p-3">
            <div class="d-flex align-items-center">
                <div class="widget-icon me-3 text-danger" style="background: rgba(220, 53, 69, 0.1);">
                    <i class="fa-solid fa-wallet"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Tagihan</h6>
                    <h4 class="fw-bold mb-0">Rp 0</h4>
                </div>
            </div>
        </div>
    </div>
    <!-- Semester Card -->
    <div class="col-md-3">
        <div class="card card-widget p-3">
            <div class="d-flex align-items-center">
                <div class="widget-icon me-3 text-success" style="background: rgba(25, 135, 84, 0.1);">
                    <i class="fa-solid fa-calendar-days"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Semester</h6>
                    <h4 class="fw-bold mb-0">6</h4>
                </div>
            </div>
        </div>
    </div>
    <!-- SKS Card -->
    <div class="col-md-3">
        <div class="card card-widget p-3">
            <div class="d-flex align-items-center">
                <div class="widget-icon me-3 text-info" style="background: rgba(13, 202, 240, 0.1);">
                    <i class="fa-solid fa-book-open"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Jumlah SKS</h6>
                    <h4 class="fw-bold mb-0">120</h4>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card card-widget p-4">
            <h5 class="fw-bold mb-4">Grafik Perkembangan Akademik</h5>
            <div style="height: 350px;">
                <canvas id="academicChart"></canvas>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const ctx = document.getElementById('academicChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
            datasets: [{
                label: 'IP Semester',
                data: [3.5, 3.6, 3.4, 3.8, 3.9, 3.75],
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#2a5298',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 4,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
</script>
@endpush
