import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import ImportMahasiswa from './pages/admin/ImportMahasiswa'
import ImportDosen from './pages/admin/ImportDosen'
import ManajemenKelas from './pages/admin/ManajemenKelas'
import JadwalAdmin from './pages/admin/Jadwal'
import AssignMahasiswa from './pages/admin/AssignMahasiswa'
import AssignDosen from './pages/admin/AssignDosen'
import AdminNotifikasi from './pages/admin/Notifikasi'
import ManajemenSlider from './pages/admin/ManajemenSlider'
import ManajemenMataKuliah from './pages/admin/ManajemenMataKuliah'

// Dosen Pages
import DosenDashboard from './pages/dosen/Dashboard'
import DosenQuiz from './pages/dosen/Quiz'
import DosenNotifikasi from './pages/dosen/Notifikasi'
import DosenNilai from './pages/dosen/Nilai' // Added Nilai
import DosenMateri from './pages/dosen/Materi' // Added Materi
import DosenChat from './pages/mahasiswa/Chat' // Reuse same component for now

// Mahasiswa Pages
import MahasiswaDashboard from './pages/mahasiswa/Dashboard'
import MahasiswaJadwal from './pages/mahasiswa/Jadwal'
import MahasiswaNilai from './pages/mahasiswa/Nilai'
import MahasiswaAbsensi from './pages/mahasiswa/Absensi'
import MahasiswaChat from './pages/mahasiswa/Chat'
import MahasiswaMateri from './pages/mahasiswa/Materi' // Added Materi
import MahasiswaQuiz from './pages/mahasiswa/Quiz' // Added Quiz


const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/import-mahasiswa" element={<ImportMahasiswa />} />
          <Route path="/admin/import-dosen" element={<ImportDosen />} />
          <Route path="/admin/manajemen-kelas" element={<ManajemenKelas />} />
          <Route path="/admin/jadwal" element={<JadwalAdmin />} />
          <Route path="/admin/mata-kuliah" element={<ManajemenMataKuliah />} />
          <Route path="/admin/assign-mahasiswa" element={<AssignMahasiswa />} />
          <Route path="/admin/assign-dosen" element={<AssignDosen />} />
          <Route path="/admin/notifikasi" element={<AdminNotifikasi />} />
          <Route path="/admin/slider" element={<ManajemenSlider />} />
        </Route>
      </Route>

      {/* Protected Dosen Routes */}
      <Route element={<ProtectedRoute allowedRoles={['dosen']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dosen/dashboard" element={<DosenDashboard />} />
          <Route path="/dosen/materi" element={<DosenMateri />} />
          <Route path="/dosen/quiz" element={<DosenQuiz />} />
          <Route path="/dosen/nilai" element={<DosenNilai />} />
          <Route path="/dosen/chat" element={<DosenChat />} />
          <Route path="/dosen/notifikasi" element={<DosenNotifikasi />} />
        </Route>
      </Route>

      {/* Protected Mahasiswa Routes */}
      <Route element={<ProtectedRoute allowedRoles={['mahasiswa']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/mahasiswa/dashboard" element={<MahasiswaDashboard />} />
          <Route path="/mahasiswa/jadwal" element={<MahasiswaJadwal />} />
          <Route path="/mahasiswa/materi" element={<MahasiswaMateri />} />
          <Route path="/mahasiswa/quiz" element={<MahasiswaQuiz />} />
          <Route path="/mahasiswa/nilai" element={<MahasiswaNilai />} />
          <Route path="/mahasiswa/absensi" element={<MahasiswaAbsensi />} />
          <Route path="/mahasiswa/chat" element={<MahasiswaChat />} />
        </Route>
      </Route>

      {/* Shared Protected Routes inside Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/" element={<HomeRedirect />} />
    </Routes>
  )
}

const HomeRedirect = () => {
  const { user, loading } = useAuth()
  
  if (loading) return null
  
  if (!user) return <Navigate to="/login" replace />
  
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'dosen') return <Navigate to="/dosen/dashboard" replace />
  if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/dashboard" replace />
  
  return <Navigate to="/login" replace />
}

import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
