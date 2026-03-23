import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validate
    if (newPassword.length < 8) {
      setErrors({ new_password: 'Password baru minimal 8 karakter' })
      return
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirm_password: 'Konfirmasi password tidak cocok' })
      return
    }

    setIsLoading(true)
    try {
      await api.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      })
      
      toast.success('Password berhasil diubah!')
      
      // Update local state by refetching user
      await refreshUser()
      
      // Redirect based on role
      navigate(`/${user.role}/dashboard`, { replace: true })
      
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || { general: error.response.data.message })
      } else {
        toast.error('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm ring-1 ring-amber-600/10 mb-2">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Ubah Password Default
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 px-4">
          Demi keamanan, Anda wajib mengubah password bawaan sebelum mengakses sistem.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-10 shadow-sm sm:rounded-2xl sm:px-12 ring-1 ring-gray-900/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {errors.general}
              </div>
            )}

            <Input
              label="Password Saat Ini (Default)"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Input
                label="Password Baru"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.new_password?.[0] || errors.new_password}
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirm_password}
              required
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-2.5" 
                isLoading={isLoading}
              >
                Simpan & Lanjutkan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
