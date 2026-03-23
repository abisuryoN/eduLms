import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'

const Jadwal = () => {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)

  const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const res = await api.get('/mahasiswa/jadwal')
        setJadwal(res.data)
      } catch (error) {
        console.error('Gagal memuat jadwal', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJadwal()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
  }

  // Mengelompokkan berdasarkan hari
  const groupedJadwal = hariList.reduce((acc, hari) => {
    acc[hari] = jadwal.filter(j => j.hari === hari)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Kuliah Mingguan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Daftar jadwal seluruh mata kuliah yang Anda ikuti semester ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {hariList.map(hari => (
          <Card key={hari} className="flex flex-col">
            <CardHeader className={`border-b ${groupedJadwal[hari].length > 0 ? 'bg-brand-50 border-brand-100' : 'bg-gray-50'}`}>
              <CardTitle className={`flex items-center gap-2 ${groupedJadwal[hari].length > 0 ? 'text-brand-900' : 'text-gray-500'}`}>
                <Calendar className="w-5 h-5" />
                {hari}
                {groupedJadwal[hari].length > 0 && (
                  <span className="ml-auto bg-brand-200 text-brand-800 text-xs py-0.5 px-2 rounded-full">
                    {groupedJadwal[hari].length} Kelas
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {groupedJadwal[hari].length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400 italic">
                  Tidak ada jadwal
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {groupedJadwal[hari].map(j => (
                    <li key={j.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="font-bold text-gray-900 mb-1 leading-tight">
                        {j.kelas?.mata_kuliah?.nama || '-'}
                      </div>
                      <div className="text-xs text-brand-600 font-medium mb-3">
                        Kelas: {j.kelas?.nama_kelas}
                      </div>
                      
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{j.jam_mulai.substring(0,5)} - {j.jam_selesai.substring(0,5)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{j.gedung ? `${j.gedung} / ${j.ruangan}` : 'Ruangan TBA'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100 mt-2">
                          <div className="w-6 text-center text-gray-400 mt-0.5">👤</div>
                          <div>{j.kelas?.dosen?.user?.name}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Jadwal
