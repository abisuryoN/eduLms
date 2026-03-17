@extends('layouts.dashboard')

@section('title', 'Profil Saya')

@section('content')
<div class="container-fluid">
    <div class="row g-4">
        <!-- Dashboard Style Profile Card (Left) -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm text-center p-4">
                <div class="profile-img-container mx-auto mb-4 position-relative">
                    @php
                        $avatar = Auth::user()->student->photo 
                            ? asset('storage/' . Auth::user()->student->photo) 
                            : 'https://ui-avatars.com/api/?name=' . urlencode(Auth::user()->name) . '&background=2a5298&color=fff&size=200';
                    @endphp
                    <img src="{{ $avatar }}" class="rounded-circle shadow-sm border border-4 border-white" style="width: 180px; height: 180px; object-fit: cover;">
                    <label for="photo_upload" class="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 shadow-sm" style="cursor: pointer;">
                        <i class="fa-solid fa-camera"></i>
                    </label>
                </div>
                <h4 class="fw-bold mb-1">{{ Auth::user()->name }}</h4>
                <p class="text-muted small mb-3">Mahasiswa - {{ Auth::user()->student->nim ?? 'NIM Belum Ada' }}</p>
                <div class="d-grid gap-2 mb-4">
                    <div class="bg-light p-3 rounded-4 text-start">
                        <div class="d-flex align-items-center mb-2">
                             <i class="fa-solid fa-envelope text-primary me-2"></i>
                             <span class="small text-muted">{{ Auth::user()->email }}</span>
                        </div>
                        <div class="d-flex align-items-center">
                             <i class="fa-solid fa-phone text-primary me-2"></i>
                             <span class="small text-muted">{{ Auth::user()->student->no_telp ?? 'Belum Diatur' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Multi-tab Form (Right) -->
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm p-2">
                <div class="card-header bg-white border-bottom-0 pb-0">
                    <ul class="nav nav-pills custom-pills mb-3" id="biodataTabs" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" id="data-diri-tab" data-bs-toggle="tab" data-bs-target="#data-diri" type="button">Data Diri</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="alamat-tab" data-bs-toggle="tab" data-bs-target="#alamat" type="button">Alamat</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="orang-tua-tab" data-bs-toggle="tab" data-bs-target="#orang-tua" type="button">Orang Tua / Wali</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="akademik-tab" data-bs-toggle="tab" data-bs-target="#akademik" type="button">Sekolah / CV</button>
                        </li>
                    </ul>
                </div>
                <div class="card-body">
                    @if($errors->any())
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <ul class="mb-0 small">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('biodata.complete') }}" enctype="multipart/form-data" id="profileForm">
                        @csrf
                        <input type="file" id="photo_upload" name="photo" style="display: none;" onchange="this.form.submit()">

                        <div class="tab-content" id="biodataTabsContent">
                            <!-- Data Diri Tab -->
                            <div class="tab-pane fade show active" id="data-diri">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Nama Lengkap</label>
                                        <input type="text" class="form-control bg-light" value="{{ Auth::user()->name }}" disabled>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">NIM</label>
                                        <input type="text" class="form-control bg-light" value="{{ Auth::user()->student->nim ?? '' }}" disabled>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">NIK (No. KTP)</label>
                                        <input type="text" name="nik" class="form-control" value="{{ old('nik', Auth::user()->student->nik ?? '') }}" placeholder="16 digit NIK">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">NPWP (Jika ada)</label>
                                        <input type="text" name="npwp" class="form-control" value="{{ old('npwp', Auth::user()->student->npwp ?? '') }}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Jenis Kelamin</label>
                                        <select name="jenis_kelamin" class="form-select">
                                            <option value="">Pilih...</option>
                                            <option value="Laki-laki" {{ old('jenis_kelamin', Auth::user()->student->jenis_kelamin ?? '') == 'Laki-laki' ? 'selected' : '' }}>Laki-laki</option>
                                            <option value="Perempuan" {{ old('jenis_kelamin', Auth::user()->student->jenis_kelamin ?? '') == 'Perempuan' ? 'selected' : '' }}>Perempuan</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Tempat Lahir</label>
                                        <input type="text" name="tempat_lahir" class="form-control" value="{{ old('tempat_lahir', Auth::user()->student->tempat_lahir ?? '') }}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Tanggal Lahir</label>
                                        <input type="date" name="tanggal_lahir" class="form-control" value="{{ old('tanggal_lahir', Auth::user()->student->tanggal_lahir ?? '') }}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Agama</label>
                                        <select name="agama" class="form-select">
                                            <option value="">Pilih...</option>
                                            @foreach(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Lainnya'] as $agm)
                                                <option value="{{ $agm }}" {{ old('agama', Auth::user()->student->agama ?? '') == $agm ? 'selected' : '' }}>{{ $agm }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Status Perkawinan</label>
                                        <select name="status_perkawinan" class="form-select">
                                            <option value="Belum Menikah" {{ old('status_perkawinan', Auth::user()->student->status_perkawinan ?? '') == 'Belum Menikah' ? 'selected' : '' }}>Belum Menikah</option>
                                            <option value="Menikah" {{ old('status_perkawinan', Auth::user()->student->status_perkawinan ?? '') == 'Menikah' ? 'selected' : '' }}>Menikah</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Golongan Darah</label>
                                        <select name="golongan_darah" class="form-select">
                                            <option value="">Pilih...</option>
                                            @foreach(['A', 'B', 'AB', 'O'] as $goldar)
                                                <option value="{{ $goldar }}" {{ old('golongan_darah', Auth::user()->student->golongan_darah ?? '') == $goldar ? 'selected' : '' }}>{{ $goldar }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Ukuran Baju</label>
                                        <select name="ukuran_baju" class="form-select">
                                            @foreach(['S', 'M', 'L', 'XL', 'XXL'] as $size)
                                                <option value="{{ $size }}" {{ old('ukuran_baju', Auth::user()->student->ukuran_baju ?? '') == $size ? 'selected' : '' }}>{{ $size }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Alamat Tab -->
                            <div class="tab-pane fade" id="alamat">
                                <div class="mb-3">
                                    <label class="form-label">Alamat Lengkap (KTP)</label>
                                    <textarea name="alamat_lengkap" class="form-control" rows="3">{{ old('alamat_lengkap', Auth::user()->student->alamat_lengkap ?? '') }}</textarea>
                                </div>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">No. Telepon / HP</label>
                                        <input type="text" name="no_telp" class="form-control" value="{{ old('no_telp', Auth::user()->student->no_telp ?? '') }}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control bg-light" value="{{ Auth::user()->email }}" disabled>
                                    </div>
                                </div>
                            </div>

                            <!-- Orang Tua Tab -->
                            <div class="tab-pane fade" id="orang-tua">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Nama Ayah</label>
                                        <input type="text" name="nama_ayah" class="form-control" value="{{ old('nama_ayah', Auth::user()->student->nama_ayah ?? '') }}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Nama Ibu</label>
                                        <input type="text" name="nama_ibu" class="form-control" value="{{ old('nama_ibu', Auth::user()->student->nama_ibu ?? '') }}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Nama Wali (Jika ada)</label>
                                        <input type="text" name="nama_wali" class="form-control" value="{{ old('nama_wali', Auth::user()->student->nama_wali ?? '') }}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">No. Telp Orang Tua / Wali</label>
                                        <input type="text" name="no_telp_ortu" class="form-control" value="{{ old('no_telp_ortu', Auth::user()->student->no_telp_ortu ?? '') }}">
                                    </div>
                                </div>
                            </div>

                            <!-- Akademik Tab -->
                            <div class="tab-pane fade" id="akademik">
                                <div class="mb-3">
                                    <label class="form-label">Sekolah Asal</label>
                                    <input type="text" name="sekolah_asal" class="form-control" value="{{ old('sekolah_asal', Auth::user()->student->sekolah_asal ?? '') }}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Biodata Singkat</label>
                                    <textarea name="biodata" class="form-control" rows="3" placeholder="Ceritakan singkat tentang diri Anda...">{{ old('biodata', Auth::user()->student->biodata ?? '') }}</textarea>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Upload Curriculum Vitae (CV)</label>
                                    <input type="file" name="cv_file" class="form-control" accept=".pdf,.doc,.docx">
                                    @if(Auth::user()->student->cv_path)
                                        <small class="text-success mt-1 d-block"><i class="fa-solid fa-check-circle"></i> CV Sudah Terupload: <a href="{{ asset('storage/' . Auth::user()->student->cv_path) }}" target="_blank">Lihat CV</a></small>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-top d-flex justify-content-between">
                            <button type="button" class="btn btn-light rounded-pill px-4" id="prevTab" style="display: none;">Sebelumnya</button>
                            <button type="button" class="btn btn-primary rounded-pill px-5 ms-auto" id="nextTab">Selanjutnya</button>
                            <button type="submit" class="btn btn-success rounded-pill px-5 ms-auto" id="submitBtn" style="display: none;">Simpan Seluruh Data</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .custom-pills .nav-link {
        color: #6c757d;
        font-weight: 600;
        border-radius: 8px;
        margin-right: 10px;
        padding: 10px 20px;
        transition: 0.3s;
    }
    .custom-pills .nav-link.active {
        background: #2a5298 !important;
        color: #fff !important;
    }
    .nav-pills .nav-link:hover:not(.active) {
        background: rgba(42, 82, 152, 0.05);
    }
    .form-label {
        font-weight: 600;
        font-size: 0.85rem;
        color: #555;
    }
    .card {
        border-radius: 15px;
        border: none;
    }
</style>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const tabs = ['data-diri-tab', 'alamat-tab', 'orang-tua-tab', 'akademik-tab'];
        let currentIdx = 0;

        const nextBtn = document.getElementById('nextTab');
        const prevBtn = document.getElementById('prevTab');
        const submitBtn = document.getElementById('submitBtn');

        function updateButtons() {
            prevBtn.style.display = currentIdx === 0 ? 'none' : 'block';
            if (currentIdx === tabs.length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }

        nextBtn.addEventListener('click', () => {
            if (currentIdx < tabs.length - 1) {
                currentIdx++;
                const triggerEl = document.getElementById(tabs[currentIdx]);
                bootstrap.Tab.getInstance(triggerEl)?.show() || new bootstrap.Tab(triggerEl).show();
                updateButtons();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIdx > 0) {
                currentIdx--;
                const triggerEl = document.getElementById(tabs[currentIdx]);
                bootstrap.Tab.getInstance(triggerEl)?.show() || new bootstrap.Tab(triggerEl).show();
                updateButtons();
            }
        });

        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach((btn, idx) => {
            btn.addEventListener('shown.bs.tab', () => {
                currentIdx = idx;
                updateButtons();
            });
        });
    });
</script>
@endpush
@endsection
