import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Search, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const Nilai = () => {
  const { kelasId } = useParams()
  const [kelasDetail, setKelasDetail] = useState(null)
  const [nilaiData, setNilaiData] = useState([])
  const [mahasiswaDaftar, setMahasiswaDaftar] = useState([])
  const [loading, setLoading] = useState(true)

  // Map of mhsId => inputs
  const [inputData, setInputData] = useState({})
  const [savingMap, setSavingMap] = useState({})
  
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [resNilai, resMhs, resKelas] = await Promise.all([
          api.get(`/dosen/kelas/${kelasId}/nilai`),
          api.get(`/dosen/kelas/${kelasId}/mahasiswa`),
          api.get('/dosen/kelas') // simplification to get name
        ])
        
        const nilaiArr = resNilai.data
        setNilaiData(nilaiArr)
        setMahasiswaDaftar(resMhs.data)
        
        const target = resKelas.data.find(k => k.id === parseInt(kelasId))
        setKelasDetail(target)

        // Initialize input map
        const initialInputs = {}
        resMhs.data.forEach(mhs => {
          const rowNilai = nilaiArr.find(n => n.mahasiswa_id === mhs.id)
          initialInputs[mhs.id] = {
            tugas: rowNilai?.tugas || 0,
            uts: rowNilai?.uts || 0,
            uas: rowNilai?.uas || 0,
            total: rowNilai?.total || 0,
            grade: rowNilai?.grade || '-'
          }
        })
        setInputData(initialInputs)

      } catch (error) {
        toast.error('Gagal memuat data nilai')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [kelasId])

  const handleInputChange = (mhsId, field, value) => {
    let numVal = parseFloat(value)
    if (isNaN(numVal)) numVal = ''
    if (numVal > 100) numVal = 100
    if (numVal < 0) numVal = 0

    setInputData(prev => ({
      ...prev,
      [mhsId]: {
        ...prev[mhsId],
        [field]: numVal
      }
    }))
  }

  const handleSaveRow = async (mhsId) => {
    const vals = inputData[mhsId]
    if (vals.tugas === '' || vals.uts === '' || vals.uas === '') {
      toast.error('Semua nilai form harus diisi dengan angka')
      return
    }

    setSavingMap(prev => ({ ...prev, [mhsId]: true }))
    try {
      const res = await api.post(`/dosen/kelas/${kelasId}/nilai`, {
        mahasiswa_id: mhsId,
        tugas: vals.tugas,
        uts: vals.uts,
        uas: vals.uas
      })
      
      // Update local state with exact calculated result
      setInputData(prev => ({
        ...prev,
        [mhsId]: {
          tugas: res.data.tugas,
          uts: res.data.uts,
          uas: res.data.uas,
          total: res.data.total,
          grade: res.data.grade
        }
      }))
      toast.success('Nilai berhasil disimpan')
    } catch (error) {
       toast.error('Gagal menyimpan nilai')
    } finally {
      setSavingMap(prev => ({ ...prev, [mhsId]: false }))
    }
  }

  const filteredMhs = mahasiswaDaftar.filter(m => 
    m.user?.name.toLowerCase().includes(search.toLowerCase()) || 
    m.nim.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dosen/dashboard">
            <Button variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Nilai</h1>
            <p className="mt-1 text-sm text-gray-500">
              {kelasDetail ? `${kelasDetail.mata_kuliah?.nama} - ${kelasDetail.nama_kelas}` : 'Memuat data...'}
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIM / Nama..."
            className="pl-9 block w-full rounded-xl border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 top-0 sticky">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 w-64">Mahasiswa</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-32">Nilai Tugas (30%)</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-32">Nilai UTS (30%)</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-32">Nilai UAS (40%)</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-24">Grade</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-32 pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredMhs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500">Mahasiswa tidak ditemukan.</td>
                </tr>
              ) : (
                filteredMhs.map(mhs => {
                  const mData = inputData[mhs.id] || { tugas: 0, uts: 0, uas: 0, total: 0, grade: '-' }
                  return (
                    <tr key={mhs.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-900">
                        <div className="font-semibold">{mhs.user?.name}</div>
                        <div className="text-gray-500">{mhs.nim}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center">
                        <input
                          type="number"
                          className="w-20 text-center rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                          value={mData.tugas}
                          onChange={(e) => handleInputChange(mhs.id, 'tugas', e.target.value)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center">
                         <input
                          type="number"
                          className="w-20 text-center rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                          value={mData.uts}
                          onChange={(e) => handleInputChange(mhs.id, 'uts', e.target.value)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center">
                         <input
                          type="number"
                          className="w-20 text-center rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                          value={mData.uas}
                          onChange={(e) => handleInputChange(mhs.id, 'uas', e.target.value)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center">
                        <div className="text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            ['A','A-'].includes(mData.grade) ? 'bg-emerald-100 text-emerald-800' :
                            ['B+','B','B-'].includes(mData.grade) ? 'bg-blue-100 text-blue-800' :
                            ['C+','C','C-'].includes(mData.grade) ? 'bg-amber-100 text-amber-800' :
                            mData.grade === '-' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {mData.grade}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">Total: {mData.total}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right pr-4">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => handleSaveRow(mhs.id)}
                          isLoading={savingMap[mhs.id]}
                          className="text-xs py-1.5"
                        >
                          <Save className="w-4 h-4 mr-1" /> Simpan
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        Rumus Nilai Otomatis: <b>30% Tugas + 30% UTS + 40% UAS</b>. Grade akan dikalkulasi secara otomatis oleh sistem saat nilai disimpan.
      </div>
    </div>
  )
}

export default Nilai
