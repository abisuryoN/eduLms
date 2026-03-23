import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, LogIn } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Math Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: '+', result: 0 })
  const [captchaInput, setCaptchaInput] = useState('')

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1
    const num2 = Math.floor(Math.random() * 20) + 1
    const operator = Math.random() > 0.5 ? '+' : '-'
    
    // Ensure result is not negative for subtraction
    let n1 = num1, n2 = num2
    if (operator === '-' && n1 < n2) {
      [n1, n2] = [n2, n1]
    }
    
    const result = operator === '+' ? n1 + n2 : n1 - n2
    setCaptcha({ num1: n1, num2: n2, operator, result })
    setCaptchaInput('')
  }

  useState(() => {
    generateCaptcha()
  }, [])
  
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  if (user) {
    if (user.is_first_login) return <Navigate to="/change-password" replace />
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'dosen') return <Navigate to="/dosen/dashboard" replace />
    if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Silakan isi username dan password')
      return
    }

    if (parseInt(captchaInput) !== captcha.result) {
      toast.error('Jawaban captcha salah. Silakan coba lagi.')
      generateCaptcha()
      return
    }

    setIsLoading(true)
    try {
      const data = await login(username, password)
      toast.success(data.message || 'Login berhasil')
      
      const loggedUser = data.user
      
      // Routing handled by AuthContext state change triggering Navigate above, 
      // but we can ensure immediate redirect:
      if (loggedUser.is_first_login) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(`/${loggedUser.role}/dashboard`, { replace: true })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal login, periksa kembali data Anda')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 dark:bg-brand-500 text-white shadow-sm ring-1 ring-brand-900/10 mb-2">
            <BookOpen className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
          Sistem Akademik & LMS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in dengan akun Anda untuk melanjutkan
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white dark:bg-gray-800 px-6 py-12 shadow-sm sm:rounded-2xl sm:px-12 ring-1 ring-gray-900/5 dark:ring-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Username / ID Kerja / NIM"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan identitas Anda"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Verifikasi: Berapa {captcha.num1} {captcha.operator} {captcha.num2}?
              </label>
              <Input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Jawaban Anda"
                required
              />
              <p className="text-[10px] text-gray-400">
                Ketikkan angka yang benar untuk membuktikan Anda bukan bot.
              </p>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full flex justify-center py-2.5" 
                isLoading={isLoading}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700">
            <p className="dark:text-gray-400">Mahasiswa baru? Password default adalah <span className="font-semibold text-gray-700 dark:text-gray-300">Tanggal Lahir (YYYY-MM-DD)</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
