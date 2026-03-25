import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Users,
  UserCheck,
  BookOpen,
  Library,
  Building2,
  GraduationCap,
  AlertTriangle
} from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ShieldCheck } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_mahasiswa: 0,
    total_dosen: 0,
    total_kelas: 0,
    total_matkul: 0,
    total_fakultas: 0,
    total_prodi: 0,
  })
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const mustChangePassword = location.state?.mustChangePassword || false

  // 1. Fetch Stats (Once or when user ID changes)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        const data = res.data.data ?? res.data
        setStats(data)
      } catch (error) {
        console.log('API Response Error:', error.response?.data)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchStats()
  }, [user?.id])

  // 2. Security Notification
  useEffect(() => {
    if (user?.is_first_login || mustChangePassword) {
      toast(`Halo ${user?.name}, Anda wajib memperbarui password demi keamanan data akademik.`, {
        icon: '⚠️',
        duration: 10000,
        id: 'first-login-alert' // Prevent duplicates
      })
    }
  }, [user?.id, user?.is_first_login, mustChangePassword])
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Halo, {user?.name || 'Admin'}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ringkasan data akademik dan pengguna sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Mahasiswa"
          value={stats.total_mahasiswa}
          icon={Users}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Total Dosen"
          value={stats.total_dosen}
          icon={UserCheck}
          colorClass="bg-indigo-500"
        />
        <StatCard
          title="Total Kelas Aktif"
          value={stats.total_kelas}
          icon={BookOpen}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Mata Kuliah"
          value={stats.total_matkul}
          icon={Library}
          colorClass="bg-amber-500"
        />
        <StatCard
          title="Program Studi"
          value={stats.total_prodi}
          icon={GraduationCap}
          colorClass="bg-purple-500"
        />
        <StatCard
          title="Fakultas"
          value={stats.total_fakultas}
          icon={Building2}
          colorClass="bg-rose-500"
        />
      </div>

      {(user?.is_first_login || mustChangePassword) && (
        <Card className="bg-amber-50 border-amber-500 border-2 animate-pulse shadow-lg">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-lg text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg">Wajib Ganti Password!</h3>
                <p className="text-amber-800 text-sm">
                  Keamanan akun Anda sangat penting. Harap ganti password default Anda segera.
                </p>
              </div>
            </div>
            <Link to="/profile">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 h-12 rounded-xl shadow-md border-none whitespace-nowrap">
                Ganti Password Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
