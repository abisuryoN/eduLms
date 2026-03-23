import { useState, useEffect } from 'react'
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Library, 
  Building2, 
  GraduationCap 
} from 'lucide-react'
import api from '../../lib/api'
import { Card, CardContent } from '../../components/ui/Card'

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
  const [stats, setStats] = useState({
    total_mahasiswa: 0,
    total_dosen: 0,
    total_kelas: 0,
    total_matkul: 0,
    total_fakultas: 0,
    total_prodi: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
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
    </div>
  )
}

export default Dashboard
