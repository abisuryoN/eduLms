<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Dosen - EduLMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
</head>
<body>
    <div class="split-screen">
        <div class="split-left">
            <div>
                <h1 class="fw-bold fs-1 mb-4">Pengajar EduLMS</h1>
                <p class="fs-5">Bergabunglah untuk mendidik generasi masa depan.</p>
            </div>
        </div>
        <div class="split-right">
            <div class="auth-form-container">
                <div class="auth-brand">
                    <div class="brand-logo"><i class="fas fa-graduation-cap"></i></div>
                    <div class="brand-name">EduPortal LMS</div>
                </div>

                <div class="text-center mb-4">
                    <h2 class="auth-title">Registrasi Dosen</h2>
                </div>


                
                @if($errors->any())
                    <div class="alert alert-danger">{{ $errors->first() }}</div>
                @endif

                <form method="POST" action="{{ route('register.lecturer.post') }}">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Nama Lengkap (beserta Gelar)</label>
                        <input type="text" name="name" class="form-control form-control-lg" placeholder="Dr. John Doe, M.Kom" required value="{{ old('name') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">ID Kerja / NIP</label>
                        <input type="text" name="id_kerja" class="form-control form-control-lg" placeholder="198701012010121001" required value="{{ old('id_kerja') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Tanggal Lahir <span class="text-lowercase">(jadi password)</span></label>
                        <input type="date" name="tanggal_lahir" class="form-control form-control-lg" required value="{{ old('tanggal_lahir') }}">
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-semibold text-muted small">Fakultas</label>
                        <input type="text" name="fakultas" class="form-control form-control-lg" placeholder="Fakultas Teknik" required value="{{ old('fakultas') }}">
                    </div>
                    
                    <button type="submit" class="btn btn-primary-custom btn-lg w-100 shadow-sm text-white">
                        <i class="fas fa-user-tie me-2"></i> Daftar sebagai Dosen
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
