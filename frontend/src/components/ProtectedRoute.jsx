import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'dosen') return <Navigate to="/dosen/dashboard" replace />
    if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children ? children : <Outlet />
}
