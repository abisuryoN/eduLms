<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lengkapi Profil - EduLMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
    <style>
        .split-screen { flex-direction: column; align-items: center; justify-content: center; background: #f8f9fa; }
        .auth-form-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 600px; }
    </style>
</head>
<body>
    <div class="split-screen">
        <div class="auth-form-container mt-4 mb-4">
            <div class="text-center mb-4">
                <h2 class="auth-title">Penyelesaian Profil</h2>
                <p class="auth-subtitle">Sebelum melanjutkan, lengkapi profil Anda.</p>
            </div>
            
            @if($errors->any())
                <div class="alert alert-danger">{{ $errors->first() }}</div>
            @endif

            <form method="POST" action="{{ route('biodata.complete') }}" enctype="multipart/form-data">
                @csrf
                <div class="mb-3">
                    <label class="form-label fw-semibold">Deskripsi Biodata Pendek</label>
                    <textarea name="biodata" class="form-control" rows="4" placeholder="Ceritakan singkat tentang diri Anda..." required>{{ old('biodata') }}</textarea>
                    <small class="text-muted">Data ini dienkripsi pada database untuk keamanan Anda.</small>
                </div>
                <div class="mb-4">
                    <label class="form-label fw-semibold">Upload Curriculum Vitae (CV)</label>
                    <input type="file" name="cv_file" class="form-control" accept=".pdf,.doc,.docx" required>
                    <small class="text-muted">Format yang didukung: PDF, DOC, DOCX (Maks 5MB)</small>
                </div>
                <button type="submit" class="btn btn-primary-custom btn-lg w-100 text-white">Simpan dan Lanjutkan ke Dashboard</button>
            </form>
        </div>
    </div>
</body>
</html>
