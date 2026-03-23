import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, BookOpen, Clock, AlertCircle } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import AbsensiPopup from './AbsensiPopup'

const Dashboard = () => {
  const { user } = useAuth()
  const [jadwal, setJadwal] = useState([])
  const [kelas, setKelas] = useState([])
  const [loading, setLoading] = useState(true)

  // Absensi Modal State
  const [isAbsensiOpen, setIsAbsensiOpen] = useState(false)
  const [selectedKelasId, setSelectedKelasId] = useState(null)
  const [selectedMataKuliah, setSelectedMataKuliah] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resJadwal, resKelas] = await Promise.all([
          api.get('/dosen/jadwal-hari-ini'),
          api.get('/dosen/kelas')
        ])
        setJadwal(resJadwal.data)
        setKelas(resKelas.data)
      } catch (error) {
        console.error('Gagal mengambil data dosen', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleOpenAbsensi = (kelasId, mkName) => {
    setSelectedKelasId(kelasId)
    setSelectedMataKuliah(mkName)
    setIsAbsensiOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-brand-600 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen className="w-48 h-48 transform rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.name}</h1>
          <p className="text-brand-100 max-w-xl">
            Sistem Informasi Akademik & E-Learning. Pantau kelas, kelola materi, dan lakukan penilaian dengan mudah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Jadwal Hari Ini */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="bg-amber-50 border-amber-100 flex flex-row items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-amber-900">Jadwal Mengajar Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {jadwal.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-gray-300" />
                  </div>
                  <p>Tidak ada jadwal mengajar hari ini.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {jadwal.map((j) => (
                    <li key={j.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{j.kelas.mata_kuliah?.nama}</p>
                          <p className="text-xs text-brand-600 font-medium">{j.kelas.nama_kelas}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <Clock className="w-3.5 h-3.5" />
                            {j.jam_mulai.substring(0,5)} - {j.jam_selesai.substring(0,5)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500">
                          {j.gedung ? `${j.gedung} / ${j.ruangan}` : 'Ruangan TBA'}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenAbsensi(j.kelas_id, j.kelas.mata_kuliah?.nama)}
                        >
                          Mulai Absensi
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Daftar Kelas Active */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Daftar Kelas Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kelas.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Belum Ada Kelas</h3>
                <p className="text-sm text-gray-500 mt-1">Anda belum di-assign ke kelas manapun pada semester ini.</p>
              </div>
            ) : (
              kelas.map((k) => (
                <Card key={k.id} className="flex flex-col">
                  <CardContent className="p-5 flex-1 relative group">
                    <div className="absolute top-5 right-5 w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-lg pr-12 line-clamp-2 min-h-14">
                      {k.mata_kuliah?.nama}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">
                        {k.nama_kelas}
                      </span>
                      <span>•</span>
                      <span>{k.mata_kuliah?.sks} SKS</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {k.mahasiswa_count || 0} Mahasiswa Terdaftar
                    </div>
                  </CardContent>
                  <div className="border-t border-gray-50 bg-gray-50/50 p-4 flex gap-2 overflow-x-auto hide-scrollbar">
                     <Link to={`/dosen/kelas/${k.id}/materi`} className="flex-1">
                      <Button variant="secondary" className="w-full text-xs" size="sm">Materi</Button>
                    </Link>
                    <Link to={`/dosen/kelas/${k.id}/quiz`} className="flex-1">
                      <Button variant="secondary" className="w-full text-xs" size="sm">Quiz</Button>
                    </Link>
                    <Link to={`/dosen/kelas/${k.id}/nilai`} className="flex-1">
                      <Button variant="secondary" className="w-full text-xs" size="sm">Nilai</Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {isAbsensiOpen && (
        <AbsensiPopup 
          isOpen={isAbsensiOpen}
          onClose={() => setIsAbsensiOpen(false)}
          kelasId={selectedKelasId}
          mataKuliah={selectedMataKuliah}
        />
      )}
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
