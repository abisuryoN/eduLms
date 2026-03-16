@extends('layouts.dashboard')

@section('title', 'Tagihan Saya')

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Informasi Keuangan</h4>
    </div>
</div>

<div class="row g-4">
    <div class="col-md-8">
        <div class="card card-widget p-4">
            <h5 class="fw-bold mb-4">Riwayat Tagihan</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Jenis Tagihan</th>
                            <th>Jumlah</th>
                            <th>Status</th>
                            <th>Tanggal Realiasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payments as $payment)
                        <tr>
                            <td>
                                <div class="fw-bold">{{ $payment->type }}</div>
                                <div class="small text-muted">{{ $payment->description }}</div>
                            </td>
                            <td class="fw-bold text-dark">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                            <td>
                                <span class="badge {{ $payment->status == 'paid' ? 'bg-success' : 'bg-danger' }} px-3 py-2 rounded-pill">
                                    {{ ucfirst($payment->status) }}
                                </span>
                            </td>
                            <td>{{ $payment->paid_at ? $payment->paid_at->format('d M Y') : '-' }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="4" class="text-center py-5 text-muted">Tidak ada tagihan ditemukan.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card card-widget p-4">
            <h5 class="fw-bold mb-3">Total Tunggakan</h5>
            <div class="display-6 fw-bold text-danger mb-4">Rp 0</div>
            <p class="small text-muted mb-4">Pastikan Anda melunasi tagihan sebelum periode UTS/UAS dimulai untuk kelancaran administrasi.</p>
            <button class="btn btn-primary w-100 rounded-pill" disabled>Bayar Sekarang</button>
        </div>
    </div>
</div>
@endsection
