import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { GraduationCap } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'

const Nilai = () => {
  const [nilaiData, setNilaiData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNilai = async () => {
      try {
        const res = await api.get('/mahasiswa/nilai')
        setNilaiData(res.data.data || res.data)
      } catch (error) {
        console.error('Gagal mengambil data nilai', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNilai()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
  }

  // Calculate GPA approximation (IPK)
  const calculateIPS = () => {
    if (nilaiData.length === 0) return 0
    
    let totalBobot = 0
    let totalSKS = 0

    nilaiData.forEach(n => {
      const sks = n.sks
      let nilaiHuruf = 0
      switch(n.grade) {
        case 'A': nilaiHuruf = 4.0; break;
        case 'A-': nilaiHuruf = 3.7; break;
        case 'B+': nilaiHuruf = 3.3; break;
        case 'B': nilaiHuruf = 3.0; break;
        case 'B-': nilaiHuruf = 2.7; break;
        case 'C+': nilaiHuruf = 2.3; break;
        case 'C': nilaiHuruf = 2.0; break;
        case 'C-': nilaiHuruf = 1.7; break;
        case 'D': nilaiHuruf = 1.0; break;
        default: nilaiHuruf = 0.0;
      }
      totalBobot += (nilaiHuruf * sks)
      totalSKS += sks
    })

    if (totalSKS === 0) return 0
    return (totalBobot / totalSKS).toFixed(2)
  }

  // Format data for Recharts
  const chartData = nilaiData.map(item => ({
    name: item.mata_kuliah.length > 15 ? item.mata_kuliah.substring(0,15) + '...' : item.mata_kuliah,
    Tugas: item.tugas,
    UTS: item.uts,
    UAS: item.uas,
    Total: item.total
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transkrip Nilai Semester</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar nilai riwayat perkuliahan dan grafik indeks prestasi semestara.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-4 sm:p-5 text-white flex items-center gap-5 shadow-lg">
          <div className="bg-white/20 p-3 rounded-full hidden sm:block">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-brand-100 uppercase tracking-widest mb-1">Indeks Prestasi Sementara</div>
            <div className="text-3xl font-black">{calculateIPS()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Visualisasi Nilai per Mata Kuliah</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-80 w-full">
                 {chartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                       <RechartsTooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                         cursor={{ fill: '#F3F4F6' }}
                       />
                       <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                       <Bar dataKey="Tugas" stackId="a" fill="#93C5FD" radius={[0, 0, 4, 4]} />
                       <Bar dataKey="UTS" stackId="a" fill="#3B82F6" />
                       <Bar dataKey="UAS" stackId="a" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="flex h-full items-center justify-center text-gray-400">
                      Data belum memadai untuk digenerate grafik.
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
           <Card>
             <CardHeader>
               <CardTitle>Rincian Nilai Akademik</CardTitle>
             </CardHeader>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mata Kuliah</th>
                     <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">SKS</th>
                     <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Tugas (30%)</th>
                     <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">UTS (30%)</th>
                     <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">UAS (40%)</th>
                     <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Total Score</th>
                     <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Grade</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 bg-white">
                   {nilaiData.length === 0 ? (
                     <tr>
                       <td colSpan="7" className="py-12 text-center text-sm text-gray-500">
                         Belum ada data nilai yang dipublikasikan oleh Dosen.
                       </td>
                     </tr>
                   ) : (
                     nilaiData.map((n, idx) => (
                       <tr key={idx} className="hover:bg-gray-50/50">
                         <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                           {n.mata_kuliah}
                         </td>
                         <td className="px-4 py-4 text-center text-sm text-gray-500">{n.sks}</td>
                         <td className="px-4 py-4 text-center text-sm font-mono text-gray-600">{n.tugas}</td>
                         <td className="px-4 py-4 text-center text-sm font-mono text-gray-600">{n.uts}</td>
                         <td className="px-4 py-4 text-center text-sm font-mono text-gray-600">{n.uas}</td>
                         <td className="px-4 py-4 text-center text-sm font-bold font-mono text-gray-900">{n.total}</td>
                         <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold shadow-sm ${
                              ['A','A-'].includes(n.grade) ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              ['B+','B','B-'].includes(n.grade) ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              ['C+','C','C-'].includes(n.grade) ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              n.grade === '-' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {n.grade}
                            </span>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

export default Nilai
