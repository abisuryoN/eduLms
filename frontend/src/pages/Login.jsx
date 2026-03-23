import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, LogIn, Eye, EyeOff, ChevronRight, Layout } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const Login = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  
  // View state: 'login' or 'forgot-password'
  const [view, setView] = useState('login') 
  
  // Form state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Math Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: '+', result: 0 })
  const [captchaInput, setCaptchaInput] = useState('')
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(0)

  const quotes = [
    {
      text: "Knowledge is the theoretical understanding of something, which is acquired through lectures and textbooks. Knowledge-based learning, therefore, refers to reading, listening, and watching to obtain the information needed before progressing to the next stage of learning. Skills can be acquired by doing, and the best way to master something is through regular practise or trial and error.",
      author: "Emily Gorsky",
      sub: "In The Loop"
    },
    {
      text: "Collaborative learning is a situation in which two or more people learn or attempt to learn something together.",
      author: "Wikipedia",
      sub: "Educational Technology"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      sub: "Freedom Fighter"
    }
  ]

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1
    const num2 = Math.floor(Math.random() * 20) + 1
    const operator = Math.random() > 0.5 ? '+' : '-'
    
    let n1 = num1, n2 = num2
    if (operator === '-' && n1 < n2) {
      [n1, n2] = [n2, n1]
    }
    
    const result = operator === '+' ? n1 + n2 : n1 - n2
    setCaptcha({ num1: n1, num2: n2, operator, result })
    setCaptchaInput('')
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Redirect if already logged in
  if (user) {
    if (user.is_first_login) return <Navigate to="/change-password" replace />
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (parseInt(captchaInput) !== captcha.result) {
      toast.error('Jawaban captcha salah. Silakan coba lagi.')
      generateCaptcha()
      return
    }

    if (view === 'forgot-password') {
      setIsLoading(true)
      // Simulate reset password process
      setTimeout(() => {
        toast.success(`Link reset password telah dikirim ke ${email}`)
        setIsLoading(false)
        setView('login')
      }, 1500)
      return
    }

    setIsLoading(true)
    try {
      const data = await login(username, password)
      toast.success(data.message || 'Login berhasil')
      if (data.user.is_first_login) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(`/${data.user.role}/dashboard`, { replace: true })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal login, periksa kembali data Anda')
      generateCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white dark:bg-gray-950 transition-colors font-sans selection:bg-brand-100 selection:text-brand-900">
      
      {/* Container Form (Kiri on Desktop) */}
      <div className="flex flex-1 flex-col justify-center py-12 px-6 sm:px-12 lg:flex-none lg:w-[480px] xl:w-[560px] bg-white dark:bg-gray-950 z-10 shadow-2xl lg:shadow-none">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
             <div className="h-20 w-20 mb-4 transform hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-3xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center p-1 border-2 border-brand-500 shadow-xl shadow-brand-500/10">
                   <div className="h-full w-full rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-inner">
                      <BookOpen className="h-10 w-10" />
                   </div>
                </div>
             </div>
             <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-gray-100 uppercase">
                LMS UNINDRA
             </h2>
          </div>

          <div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {view === 'login' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Username</label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Username"
                      className="rounded-2xl border-gray-100 focus:border-brand-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="rounded-2xl pr-14 border-gray-100 focus:border-brand-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 mb-6 flex items-center gap-2">
                    <div className="h-1 w-6 bg-brand-600 rounded-full" />
                    Reset Password
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Email Gmail</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      className="rounded-2xl shadow-sm border-gray-100 focus:border-brand-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Verifikasi Keamanan</label>
                <div className="overflow-hidden rounded-2xl border border-brand-100 dark:border-gray-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent">
                   <div className="bg-brand-600 dark:bg-brand-700 py-4 text-center text-white font-mono text-xl tracking-[0.2em] font-black italic select-none">
                      {captcha.num1} {captcha.operator} {captcha.num2} = ?
                   </div>
                   <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Hasil jawaban"
                      className="w-full text-center py-4 px-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border-none focus:ring-0 placeholder-gray-400 outline-none text-lg font-bold"
                      required
                   />
                </div>
              </div>

              {view === 'login' && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center group cursor-pointer">
                    <div className="relative h-5 w-5">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer hidden"
                      />
                      <div className="h-full w-full rounded border-2 border-gray-200 dark:border-gray-700 peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="ml-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Remember me
                    </span>
                  </label>

                  <button 
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors"
                  >
                    Lupa Password
                  </button>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 text-lg rounded-2xl shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                  isLoading={isLoading}
                >
                  {view === 'login' ? (
                    <>
                      <span>Sign In</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  ) : 'Submit Request'}
                </Button>
              </div>

              {view === 'forgot-password' && (
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setView('login')}
                    className="text-sm font-bold text-gray-500 hover:text-brand-600 dark:text-gray-400 transition-colors"
                  >
                    Kembali ke halaman <span className="text-brand-600">Login</span>
                  </button>
                </div>
              )}
            </form>

            <div className="mt-16 text-center">
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
                © 2026 Universitas Indraprasta PGRI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section (Kanan on Desktop / Bawah on Mobile) */}
      <div className="relative flex-1 bg-brand-600 min-h-[500px] lg:min-h-screen overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-600/90 mix-blend-multiply transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/60 via-brand-600/40 to-transparent" />
          
          {/* Animated Background Image Placeholder (Dosen/Gedung) */}
          <div className="absolute inset-0 opacity-20 grayscale scale-110 hover:scale-100 transition-transform duration-10000">
             <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1523050335102-c89b1811b132?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center" />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-white/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-brand-400/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        {/* Slider Content */}
        <div className="relative z-10 flex h-full flex-col justify-center px-8 sm:px-12 lg:px-24 text-white py-20">
           <div className="max-w-2xl">
              <div className="mb-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-brand-100">
                 <Layout className="w-3 h-3" />
                 LMS UNINDRA UNOFFICIAL INFORMATION
              </div>

              <div className="mb-10 opacity-30">
                 <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                 </svg>
              </div>

              <div key={currentQuote} className="animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
                 <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-[1.3] mb-10 text-white italic">
                    “{quotes[currentQuote].text}”
                 </blockquote>
                 
                 <div className="flex items-center gap-5 translate-y-2">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center font-black text-2xl text-white shadow-2xl">
                       {quotes[currentQuote].author.charAt(0)}
                    </div>
                    <div>
                       <div className="font-black text-xl tracking-tight">{quotes[currentQuote].author}</div>
                       <div className="text-brand-200 text-sm font-medium">{quotes[currentQuote].sub}</div>
                    </div>
                 </div>
              </div>

              {/* Slider Controls */}
              <div className="mt-20 flex items-center gap-4">
                 <div className="flex gap-2.5">
                    {quotes.map((_, idx) => (
                       <button
                          key={idx}
                          onClick={() => setCurrentQuote(idx)}
                          className={`h-2.5 rounded-full transition-all duration-500 border border-white/20 ${
                             idx === currentQuote ? 'w-12 bg-white' : 'w-2.5 bg-white/20 hover:bg-white/40'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                       />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default Login
