<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Dashboard') - EduLMS</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}">
    @stack('styles')
</head>
<body>
    <div id="wrapper">
        <!-- Sidebar -->
        <nav id="sidebar">
            <div class="sidebar-header">
                EduLMS
            </div>

            <ul class="list-unstyled components">
                <li class="{{ Request::is('dashboard') ? 'active' : '' }}">
                    <a href="{{ route('dashboard') }}"><i class="fa-solid fa-gauge me-3"></i>Dashboard</a>
                </li>
                <li>
                    <a href="{{ route('profile.show') }}"><i class="fa-solid fa-user me-3"></i>Profil</a>
                </li>
                <li class="{{ Request::is('kelas*') ? 'active' : '' }}">
                    <a href="{{ route('kelas.index') }}"><i class="fa-solid fa-school me-3"></i>Kelas</a>
                </li>
                <li>
                    <a href="{{ route('kelas.index') }}"><i class="fa-solid fa-book me-3"></i>Mata Kuliah</a>
                </li>
                <li>
                    <a href="{{ route('kelas.index') }}"><i class="fa-solid fa-file-lines me-3"></i>Materi</a>
                </li>
                <li>
                    <a href="#"><i class="fa-solid fa-list-check me-3"></i>Tugas</a>
                </li>
                <li class="{{ Request::is('grade*') ? 'active' : '' }}">
                    <a href="{{ route('grade.history') }}"><i class="fa-solid fa-chart-simple me-3"></i>Riwayat Nilai</a>
                </li>
                <li class="{{ Request::is('attendance*') ? 'active' : '' }}">
                    <a href="{{ route('attendance.index') }}"><i class="fa-solid fa-calendar-check me-3"></i>Presensi</a>
                </li>
                <li class="{{ Request::is('chat*') ? 'active' : '' }}">
                    <a href="{{ route('chat.show') }}"><i class="fa-solid fa-comments me-3"></i>Chat Kelas</a>
                </li>
                <li class="{{ Request::is('payment*') ? 'active' : '' }}">
                    <a href="{{ route('payment.history') }}"><i class="fa-solid fa-credit-card me-3"></i>Riwayat Tagihan</a>
                </li>
                <li class="{{ Request::is('krs*') ? 'active' : '' }}">
                    <a href="{{ route('krs.index') }}"><i class="fa-solid fa-file-pen me-3"></i>Isi KRS</a>
                </li>
                <li class="mt-4">
                    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                        @csrf
                    </form>
                    <a href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" class="text-danger">
                        <i class="fa-solid fa-right-from-bracket me-3"></i>Logout
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Page Content -->
        <div id="content">
            <nav class="navbar navbar-expand-lg top-navbar">
                <div class="container-fluid">
                    <button type="button" id="sidebarCollapse" class="btn btn-light d-md-none">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <div class="ms-auto d-flex align-items-center">
                        <span class="me-3 fw-medium text-muted">Selamat datang, {{ Auth::user()->name }}</span>
                        <div class="dropdown">
                            <a class="dropdown-toggle text-decoration-none text-dark" href="#" role="button" data-bs-toggle="dropdown">
                                @php
                                    $avatar = 'https://ui-avatars.com/api/?name='.urlencode(Auth::user()->name);
                                    if (Auth::user()->student && Auth::user()->student->foto) {
                                        $foto = Auth::user()->student->foto;
                                        $avatar = (str_starts_with($foto, 'http')) ? $foto : asset('storage/' . $foto);
                                    }
                                @endphp
                                <img src="{{ $avatar }}" alt="Avatar" class="rounded-circle" width="35" height="35" onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode(Auth::user()->name) }}'">
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#">Profil</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="container-fluid py-4">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                @if(Auth::user()->role->name == 'Mahasiswa' && !Auth::user()->is_biodata_completed)
                    <div class="alert alert-warning border-0 shadow-sm d-flex align-items-center" role="alert">
                        <i class="fa-solid fa-circle-exclamation fs-4 me-3 text-warning"></i>
                        <div>
                            <h6 class="alert-heading mb-1 fw-bold">Lengkapi Biodata Anda</h6>
                            <p class="mb-0 small">Silakan lengkapi biodata mulai dari profil kampus hingga upload CV untuk mengaktifkan semua fitur.</p>
                        </div>
                        <a href="{{ route('profile.show') }}" class="btn btn-warning btn-sm ms-auto fw-bold text-dark">Lengkapi Sekarang</a>
                    </div>
                @endif
                
                @yield('content')
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.getElementById('sidebarCollapse')?.addEventListener('click', function () {
            document.getElementById('sidebar').classList.toggle('active');
        });
    </script>
    @stack('scripts')
</body>
</html>
