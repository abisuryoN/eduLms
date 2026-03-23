import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, LogIn, Eye, EyeOff, ChevronRight, Layout, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
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
    const [quotes, setQuotes] = useState([])
    const [slidesLoading, setSlidesLoading] = useState(true)

    useEffect(() => {
        // Check Remember Me
        const remembered = localStorage.getItem('remember_me')
        if (remembered) {
            try {
                const { username: remUser, password: remPass } = JSON.parse(remembered)
                setUsername(remUser)
                setPassword(remPass)
                setRememberMe(true)
            } catch (e) {
                localStorage.removeItem('remember_me')
            }
        }

        const fetchQuotes = async () => {
            try {
                const response = await api.get('/login-slides')
                if (response.data?.success && response.data.data?.length > 0) {
                    setQuotes(response.data.data)
                } else if (response.data?.length > 0) {
                    setQuotes(response.data)
                }
            } catch (error) {
                console.error('Failed to fetch dynamic quotes:', error)
            } finally {
                setSlidesLoading(false)
            }
        }
        fetchQuotes()
    }, [])

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
    }, [quotes.length])

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
            
            // Save Remember Me
            if (rememberMe) {
                localStorage.setItem('remember_me', JSON.stringify({ username, password }))
            } else {
                localStorage.removeItem('remember_me')
            }

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
        <div className="flex min-h-screen flex-col lg:flex-row bg-white dark:bg-gray-950 transition-colors font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
            
            {/* Left Section: Login Form */}
            <div className="flex flex-1 flex-col justify-center py-12 px-6 sm:px-12 lg:flex-none lg:w-[480px] xl:w-[560px] bg-white dark:bg-gray-950 z-10 shadow-2xl lg:shadow-none relative">
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
                                        className="rounded-2xl border-gray-100 focus:border-brand-500 h-12"
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
                                            className="rounded-2xl pr-14 border-gray-100 focus:border-brand-500 h-12"
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
                                        <div className={`h-full w-full rounded border-2 transition-all flex items-center justify-center ${
                                            rememberMe 
                                                ? 'bg-brand-600 border-brand-600' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}>
                                            {rememberMe && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
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

            {/* Right Section: Dynamic Slider Hero */}
            <div className="relative flex-1 bg-brand-600 overflow-hidden min-h-[500px] lg:min-h-screen">
                {/* Background Carousel Layer */}
                <div className="absolute inset-0 z-0">
                    {quotes.map((quote, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                                index === currentQuote ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                            }`}
                        >
                            {quote.image_url ? (
                                <img 
                                    src={quote.image_url} 
                                    alt="" 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800" />
                            )}
                            {/* Dark/Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/40 to-transparent dark:from-black/90 dark:via-black/40" />
                            <div className="absolute inset-0 bg-brand-900/20 backdrop-blur-[2px]" />
                        </div>
                    ))}
                </div>

                {/* Foreground Content Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 sm:px-12 lg:px-24 text-center z-10">
                    <div className="max-w-xl w-full">
                        <div className="mb-10 flex justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                                <Layout className="h-3.5 w-3.5" />
                                LMS UNINDRA UNOFFICIAL INFORMATION
                            </div>
                        </div>

                        <div className="relative min-h-[300px] flex flex-col items-center justify-center">
                            {quotes.map((quote, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 delay-300 ${
                                        index === currentQuote 
                                            ? 'opacity-100 translate-y-0 scale-100' 
                                            : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
                                    }`}
                                >
                                    <div className="mb-8 opacity-40">
                                        <svg width="45" height="45" viewBox="0 0 45 45" fill="none" className="text-white">
                                            <path d="M11.25 33.75H18.75L22.5 26.25V11.25H7.5V26.25H15L11.25 33.75ZM30 33.75H37.5L41.25 26.25V11.25H26.25V26.25H33.75L30 33.75Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-10 leading-tight italic drop-shadow-xl">
                                        "{quote.text}"
                                    </h2>
                                    
                                    <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md p-5 rounded-[2.5rem] border border-white/10">
                                        <div className="h-14 w-14 rounded-3xl bg-brand-500/30 flex items-center justify-center text-white font-black text-2xl border border-white/20 shadow-inner">
                                            {quote.author.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xl font-bold text-white leading-none mb-1.5">{quote.author}</p>
                                            <p className="text-xs text-brand-200 font-black uppercase tracking-widest">{quote.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Custom Pagination */}
                        <div className="mt-16 flex justify-center gap-3">
                            {quotes.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuote(index)}
                                    className={`h-2 transition-all duration-500 rounded-full ${
                                        index === currentQuote 
                                            ? 'w-12 bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]' 
                                            : 'w-2.5 bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative background icon */}
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] select-none pointer-events-none">
                    <BookOpen className="h-80 w-80 text-white rotate-[15deg]" />
                </div>
            </div>
        </div>
    )
}

export default Login
