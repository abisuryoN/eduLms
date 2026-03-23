import { useState, useEffect } from 'react'
import { ClipboardList, PieChart } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'

const Absensi = () => {
  const [absensiData, setAbsensiData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const res = await api.get('/mahasiswa/absensi')
        setAbsensiData(res.data)
      } catch (error) {
        console.error('Gagal mengambil absensi', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAbsensi()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi Kehadiran</h1>
        <p className="mt-1 text-sm text-gray-500">
          Statistik absensi per pertemuan per mata kuliah. Pastikan kehadiran &gt; 75% untuk bisa mengikuti ujian.
        </p>
      </div>

      {absensiData.length === 0 ? (
        <Card className="p-16 text-center text-gray-500 border-dashed">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Data Absensi Bersih</h3>
          <p>Dosen belum mencatat absensi apapun untuk kelas yang Anda ikuti.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {absensiData.map((item, idx) => {
            const pct = item.persentase
            let colorTheme = 'emerald'
            if (pct < 75) colorTheme = 'red'
            else if (pct < 85) colorTheme = 'amber'

            return (
              <Card key={idx} className="flex flex-col">
                <CardHeader className="border-b bg-gray-50/50 flex flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="leading-tight mb-1">{item.mata_kuliah}</CardTitle>
                    <p className="text-xs font-semibold text-brand-600">Dosen: {item.dosen}</p>
                  </div>
                  <div className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-sm bg-white ${
                    colorTheme === 'emerald' ? 'border-emerald-500 text-emerald-700' :
                    colorTheme === 'amber' ? 'border-amber-500 text-amber-700' :
                    'border-red-500 text-red-700'
                  }`}>
                    <span className="text-sm font-black">{Math.round(pct)}%</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <div className="flex bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 text-center divide-x divide-gray-100">
                    <div className="flex-1 py-3"><span className="block text-xl font-bold text-gray-900 mb-0.5">{item.total_pertemuan}</span> Total</div>
                    <div className="flex-1 py-3"><span className="block text-xl font-bold text-emerald-600 mb-0.5">{item.hadir}</span> Hadir</div>
                    <div className="flex-1 py-3"><span className="block text-xl font-bold text-amber-600 mb-0.5">{item.izin}</span> Izin/Skt</div>
                    <div className="flex-1 py-3"><span className="block text-xl font-bold text-red-600 mb-0.5">{item.alpha}</span> Alpha</div>
                  </div>
                  
                  <div className="p-4 bg-white">
                     <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Histori Pertemuan Terakhir</p>
                     <div className="flex flex-wrap gap-2">
                       {item.records && item.records.length > 0 ? (
                          item.records.map((rec) => (
                             <div key={rec.id} className="relative group">
                               <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border cursor-default transition-colors ${
                                 rec.status === 'hadir' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :
                                 rec.status === 'izin' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' :
                                 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                               }`}>
                                 {rec.pertemuan}
                               </div>
                               {/* Tooltip on hover */}
                               <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-gray-900 text-white text-[10px] rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                                 Pertemuan {rec.pertemuan}: {rec.status.toUpperCase()}
                                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                               </div>
                             </div>
                          ))
                       ) : (
                          <div className="text-sm text-gray-400">Belum ada rincian pertemuan.</div>
                       )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Absensi
