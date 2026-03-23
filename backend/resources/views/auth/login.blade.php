<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - EduLMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
</head>
<body>
    <div class="split-screen">
        <div class="split-left">
            <div>
                <h1 class="fw-bold fs-1 mb-4">EduLMS</h1>
                <p class="fs-5">Platform Pembelajaran Terpadu untuk Mahasiswa dan Dosen.</p>
            </div>
        </div>
        <div class="split-right">
            <div class="auth-form-container">
                <div class="auth-brand">
                    <div class="brand-logo"><i class="fas fa-graduation-cap"></i></div>
                    <div class="brand-name">EduPortal LMS</div>
                </div>

                <div class="text-center mb-4">
                    <h2 class="auth-title">Selamat Datang</h2>
                    <p class="auth-subtitle">Silakan login untuk melanjutkan</p>
                </div>
                
                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif
                @if($errors->any())
                    <div class="alert alert-danger">{{ $errors->first() }}</div>
                @endif

                <form method="POST" action="{{ route('login') }}">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Username</label>
                        <input type="text" name="username" class="form-control form-control-lg" placeholder="Masukkan username" required value="{{ old('username') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Password</label>
                        <input type="password" name="password" class="form-control form-control-lg" placeholder="••••••••" required>
                    </div>

                    <button type="submit" class="btn btn-primary-custom btn-lg w-100 shadow-sm text-white">Login Sekarang</button>
                    
                    <div class="text-center mt-4">
                        <p class="text-muted small">Belum punya akun? <a href="{{ route('register.student') }}" class="text-decoration-none fw-bold text-primary">Daftar di sini</a></p>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
