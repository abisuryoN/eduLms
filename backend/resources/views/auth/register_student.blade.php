<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Mahasiswa - EduLMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
</head>
<body>
    <div class="split-screen">
        <div class="split-left">
            <div>
                <h1 class="fw-bold fs-1 mb-4">Gabung EduLMS</h1>
                <p class="fs-5">Mulai perjalanan akademik Anda dengan platform modern kami.</p>
            </div>
        </div>
        <div class="split-right">
            <div class="auth-form-container">
                <div class="auth-brand">
                    <div class="brand-logo"><i class="fas fa-graduation-cap"></i></div>
                    <div class="brand-name">EduPortal LMS</div>
                </div>

                <div class="text-center mb-4">
                    <h2 class="auth-title">Registrasi Mahasiswa</h2>
                </div>


                
                @if($errors->any())
                    <div class="alert alert-danger">{{ $errors->first() }}</div>
                @endif

                <form method="POST" action="{{ route('register.student.post') }}" enctype="multipart/form-data">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Nama Lengkap</label>
                        <input type="text" name="name" class="form-control form-control-lg" placeholder="Abi" required value="{{ old('name') }}">
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-semibold text-muted small">NIM</label>
                            <input type="text" name="nim" class="form-control form-control-lg" placeholder="202343500814" required value="{{ old('nim') }}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-semibold text-muted small">Tanggal Lahir</label>
                            <input type="date" name="tanggal_lahir" class="form-control form-control-lg" required value="{{ old('tanggal_lahir') }}">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-semibold text-muted small">Kelas</label>
                            <input type="text" name="kelas" class="form-control form-control-lg" placeholder="RJ" required value="{{ old('kelas') }}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-semibold text-muted small">Semester</label>
                            <select name="semester" class="form-select form-control-lg">
                                @for($i=1; $i<=8; $i++)
                                    <option value="{{ $i }}" {{ old('semester') == $i ? 'selected' : '' }}>Semester {{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-semibold text-muted small">Tahun Masuk</label>
                            <select name="tahun_masuk" class="form-select form-control-lg">
                                @for($y=date('Y'); $y>=2018; $y--)
                                    <option value="{{ $y }}" {{ old('tahun_masuk') == $y ? 'selected' : '' }}>{{ $y }}</option>
                                @endfor
                            </select>
                        </div>
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-semibold text-muted small">Foto Profil <span class="text-lowercase">(opsional)</span></label>
                            <input type="file" name="foto" class="form-control form-control-lg" accept="image/*">
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary-custom btn-lg w-100 shadow-sm text-white">
                        <i class="fas fa-user-plus me-2"></i> Daftar sebagai Mahasiswa
                    </button>
                    
                    <div class="text-center mt-4">
                        <p class="text-muted small">Sudah punya akun? <a href="{{ route('login') }}" class="text-decoration-none fw-bold text-primary">Masuk di sini</a></p>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
