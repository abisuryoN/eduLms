@extends('layouts.dashboard')

@section('title', 'Pengisian KRS')

@section('content')
<div class="row">
    <div class="col-12">
        <h4 class="fw-bold mb-4">Kartu Rencana Studi (KRS)</h4>
    </div>
</div>

<div class="row g-4">
    <div class="col-md-12">
        <div class="card card-widget p-5 text-center">
            <div class="mb-4">
                <i class="fa-solid fa-calendar-check text-primary" style="font-size: 4rem;"></i>
            </div>
            <h4 class="fw-bold mb-3">Periode Pengisian KRS Belum Dibuka</h4>
            <p class="text-muted mx-auto" style="max-width: 500px;">
                Pengisian KRS untuk semester depan akan dibuka pada awal semester baru. Silakan pantau terus pengumuman di dashboard Anda.
            </p>
            <div class="mt-4">
                <a href="{{ route('dashboard') }}" class="btn btn-primary px-4 py-2 rounded-pill">Kembali ke Dashboard</a>
            </div>
        </div>
    </div>
</div>
@endsection
