<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lengkapi Profil - EduLMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
    <style>
        body { background-color: #f0f2f5; font-family: 'Inter', sans-serif; }
        .biodata-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 100%; max-width: 1000px; margin: 2rem auto; }
        .nav-tabs .nav-link { color: #6c757d; font-weight: 500; border: none; padding: 1rem 1.5rem; }
        .nav-tabs .nav-link.active { color: #2a5298; border-bottom: 3px solid #2a5298; background: none; }
        .form-label { font-weight: 600; color: #495057; font-size: 0.9rem; }
        .btn-primary-custom { background: #2a5298; border: none; padding: 0.8rem 2rem; border-radius: 8px; font-weight: 600; }
        .btn-primary-custom:hover { background: #1e3c72; }
    </style>
</head>
<body>
    <div class="container pb-5">
        <div class="biodata-container">
            <div class="text-center mb-4">
                <h2 class="fw-bold" style="color: #2a5298;">Penyelesaian Profil</h2>
                <p class="text-muted">Sebelum melanjutkan, silakan lengkapi data diri Anda secara menyeluruh.</p>
            </div>
            
            @if($errors->any())
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <ul class="mb-0">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            <form method="POST" action="{{ route('biodata.complete') }}" enctype="multipart/form-data">
                @csrf
                
                <ul class="nav nav-tabs mb-4" id="biodataTabs" role="tablist">
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

                <div class="tab-content" id="biodataTabsContent">
                    <!-- Data Diri Tab -->
                    <div class="tab-pane fade show active" id="data-diri">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Nama Lengkap</label>
                                <input type="text" class="form-control" value="{{ Auth::user()->name }}" disabled>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">NIM</label>
                                <input type="text" class="form-control" value="{{ Auth::user()->student->nim ?? '' }}" disabled>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">NIK (No. KTP)</label>
                                <input type="text" name="nik" class="form-control" value="{{ old('nik') }}" placeholder="16 digit NIK">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">NPWP (Jika ada)</label>
                                <input type="text" name="npwp" class="form-control" value="{{ old('npwp') }}">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Jenis Kelamin</label>
                                <select name="jenis_kelamin" class="form-select">
                                    <option value="">Pilih...</option>
                                    <option value="Laki-laki" {{ old('jenis_kelamin') == 'Laki-laki' ? 'selected' : '' }}>Laki-laki</option>
                                    <option value="Perempuan" {{ old('jenis_kelamin') == 'Perempuan' ? 'selected' : '' }}>Perempuan</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Tempat Lahir</label>
                                <input type="text" name="tempat_lahir" class="form-control" value="{{ old('tempat_lahir') }}">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Tanggal Lahir</label>
                                <input type="date" name="tanggal_lahir" class="form-control" value="{{ old('tanggal_lahir') }}">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Agama</label>
                                <select name="agama" class="form-select">
                                    <option value="">Pilih...</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Kristen">Kristen</option>
                                    <option value="Katolik">Katolik</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Budha">Budha</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Status Perkawinan</label>
                                <select name="status_perkawinan" class="form-select">
                                    <option value="Belum Menikah">Belum Menikah</option>
                                    <option value="Menikah">Menikah</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Golongan Darah</label>
                                <select name="golongan_darah" class="form-select">
                                    <option value="">Pilih...</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Ukuran Baju</label>
                                <select name="ukuran_baju" class="form-select">
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Alamat Tab -->
                    <div class="tab-pane fade" id="alamat">
                        <div class="mb-3">
                            <label class="form-label">Alamat Lengkap (KTP)</label>
                            <textarea name="alamat_lengkap" class="form-control" rows="3">{{ old('alamat_lengkap') }}</textarea>
                        </div>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">No. Telepon / HP</label>
                                <input type="text" name="no_telp" class="form-control" value="{{ old('no_telp') }}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" value="{{ Auth::user()->email }}" disabled>
                            </div>
                        </div>
                    </div>

                    <!-- Orang Tua Tab -->
                    <div class="tab-pane fade" id="orang-tua">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Nama Ayah</label>
                                <input type="text" name="nama_ayah" class="form-control" value="{{ old('nama_ayah') }}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nama Ibu</label>
                                <input type="text" name="nama_ibu" class="form-control" value="{{ old('nama_ibu') }}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nama Wali (Jika ada)</label>
                                <input type="text" name="nama_wali" class="form-control" value="{{ old('nama_wali') }}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">No. Telp Orang Tua / Wali</label>
                                <input type="text" name="no_telp_ortu" class="form-control" value="{{ old('no_telp_ortu') }}">
                            </div>
                        </div>
                    </div>

                    <!-- Akademik Tab -->
                    <div class="tab-pane fade" id="akademik">
                        <div class="mb-3">
                            <label class="form-label">Sekolah Asal</label>
                            <input type="text" name="sekolah_asal" class="form-control" value="{{ old('sekolah_asal') }}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Biodata Singkat</label>
                            <textarea name="biodata" class="form-control" rows="3" placeholder="Ceritakan singkat tentang diri Anda...">{{ old('biodata') }}</textarea>
                        </div>
                        <div class="mb-4">
                            <label class="form-label">Upload Curriculum Vitae (CV)</label>
                            <input type="file" name="cv_file" class="form-control" accept=".pdf,.doc,.docx">
                            <small class="text-muted">Format: PDF/DOC (Maks 5MB). Opsional jika sudah ada.</small>
                        </div>
                    </div>
                </div>

                <div class="mt-5 d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-secondary px-4 py-2" id="prevTab" style="display: none;">Sebelumnya</button>
                    <button type="button" class="btn btn-primary-custom text-white px-5 py-2 ms-auto" id="nextTab">Selanjutnya</button>
                    <button type="submit" class="btn btn-success px-5 py-2 ms-auto" id="submitBtn" style="display: none;">Simpan Seluruh Data</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
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

        // Update currentIdx if user clicks tabs directly
        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach((btn, idx) => {
            btn.addEventListener('shown.bs.tab', () => {
                currentIdx = idx;
                updateButtons();
            });
        });
    </script>
</body>
</html>

