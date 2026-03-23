import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if first login
  if (user.is_first_login && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'dosen') return <Navigate to="/dosen/dashboard" replace />
    if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
