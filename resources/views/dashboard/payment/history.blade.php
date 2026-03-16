@extends('layouts.dashboard')

@section('title', 'Riwayat Tagihan')

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Riwayat Pembayaran</h4>
    </div>
</div>

<div class="row g-4">
    <div class="col-12">
        <div class="card card-widget p-4">
            <h5 class="fw-bold mb-4">Daftar Transaksi Berhasil</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>ID Transaksi</th>
                            <th>Jenis Tagihan</th>
                            <th>Jumlah</th>
                            <th>Tanggal Bayar</th>
                            <th>Metode</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payments as $payment)
                        <tr>
                            <td><span class="text-monospace">#PAY-{{ str_pad($payment->id, 5, '0', STR_PAD_LEFT) }}</span></td>
                            <td>
                                <div class="fw-bold">{{ $payment->type }}</div>
                                <div class="small text-muted">{{ $payment->description }}</div>
                            </td>
                            <td class="fw-bold text-dark">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                            <td>{{ $payment->paid_at ? $payment->paid_at->format('d M Y H:i') : '-' }}</td>
                            <td>{{ $payment->method ?? 'Transfer Bank' }}</td>
                            <td>
                                <span class="badge bg-success px-3 py-2 rounded-pill">
                                    Berhasil
                                </span>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-5 text-muted">Belum ada riwayat pembayaran.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
