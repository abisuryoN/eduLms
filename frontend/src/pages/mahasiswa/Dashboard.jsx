import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, BookOpen, Clock, AlertCircle, GraduationCap } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState({
    nama: '',
    nim: '',
    semester: '',
    prodi: '',
    total_kelas: 0,
    jadwal_hari_ini: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/mahasiswa/dashboard')
        setData(res.data)
      } catch (error) {
        console.error('Gagal mengambil data dashboard mahasiswa', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
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
      {/* Welcome Banner */}
      <div className="bg-brand-600 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute -bottom-8 -right-8 p-8 opacity-10">
          <GraduationCap className="w-56 h-56 transform -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Halo, {data.nama}!</h1>
            <p className="text-brand-100 max-w-xl text-lg">
              Semester {data.semester} • {data.prodi}
            </p>
            <p className="text-brand-200 mt-1 font-mono text-sm opacity-80 border border-brand-400 bg-brand-700/50 inline-block px-3 py-1 rounded-full">
              NIM: {data.nim}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center min-w-32">
            <div className="text-3xl font-bold text-white mb-1">{data.total_kelas}</div>
            <div className="text-xs text-brand-100 font-medium uppercase tracking-wider">Kelas Aktif</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Jadwal Hari Ini */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader className="bg-emerald-50 border-emerald-100 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-emerald-900">Jadwal Kuliah Hari Ini</CardTitle>
              </div>
              <Link to="/mahasiswa/jadwal">
                <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50">
                  Lihat Semua
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {data.jadwal_hari_ini.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-gray-300" />
                  </div>
                  <p>Hore! Tidak ada jadwal kuliah hari ini.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.jadwal_hari_ini.map((j, idx) => (
                    <li key={idx} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">{j.kelas}</p>
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                          {j.dosen}
                        </p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-sm font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20 mb-1.5">
                          <Clock className="w-4 h-4" />
                          {j.jam_mulai.substring(0,5)} - {j.jam_selesai.substring(0,5)}
                        </span>
                        <div className="text-xs text-gray-500 font-medium">
                          {j.gedung ? `Gedung ${j.gedung} - Ruang ${j.ruangan}` : 'Ruangan TBA'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Quick Menu */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
             <CardHeader>
               <CardTitle>Akses Cepat</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-3 pb-6">
                <Link to="/mahasiswa/materi" className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100 text-blue-700">
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">Materi</span>
                </Link>
                <Link to="/mahasiswa/quiz" className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-100 text-orange-700">
                  <AlertCircle className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">Tugas & Quiz</span>
                </Link>
                <Link to="/mahasiswa/absensi" className="flex flex-col items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-100 text-teal-700">
                  <span className="text-2xl font-bold font-mono block mb-1">📋</span>
                  <span className="text-sm font-semibold">Absensi</span>
                </Link>
                <Link to="/mahasiswa/nilai" className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100 text-purple-700">
                  <span className="text-2xl font-bold font-mono block mb-1">A+</span>
                  <span className="text-sm font-semibold">Nilai Akhir</span>
                </Link>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Simple fallback icon
const CheckCircle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export default Dashboard
