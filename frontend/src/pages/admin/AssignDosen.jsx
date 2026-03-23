import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { toast } from 'react-hot-toast'
import { Users, GraduationCap, CheckCircle } from 'lucide-react'
import api from '../../lib/api'

const AssignDosen = () => {
  const [activeTab, setActiveTab] = useState('pengajar')
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [dosenList, setDosenList] = useState([])
  const [matkulList, setMatkulList] = useState([])
  const [kelasList, setKelasList] = useState([])

  // Form states
  const [selectedDosen, setSelectedDosen] = useState('')
  const [selectedMatkul, setSelectedMatkul] = useState('')
  const [selectedKelas, setSelectedKelas] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const [resDosen, resMatkul, resKelas] = await Promise.all([
        api.get('/admin/dosen?all=true'), // Assuming all=true bypasses pagination if backend supports it, or it will just get top 20
        api.get('/admin/mata-kuliah'),
        api.get('/admin/kelas?all=true')
      ])
      
      // Handle pagination wrapper if needed
      setDosenList(resDosen.data.data || resDosen.data)
      setMatkulList(resMatkul.data.data || resMatkul.data)
      setKelasList(resKelas.data.data || resKelas.data)
    } catch (error) {
      toast.error('Gagal memuat data referensi')
    } finally {
      setIsFetching(false)
    }
  }

  const handleKelasToggle = (kelasId) => {
    if (selectedKelas.includes(kelasId)) {
      setSelectedKelas(selectedKelas.filter(id => id !== kelasId))
    } else {
      setSelectedKelas([...selectedKelas, kelasId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedDosen) {
      return toast.error('Pilih dosen terlebih dahulu')
    }
    if (activeTab === 'pengajar' && !selectedMatkul) {
      return toast.error('Pilih mata kuliah terlebih dahulu')
    }
    if (selectedKelas.length === 0) {
      return toast.error('Pilih minimal satu kelas')
    }

    setLoading(true)
    try {
      const payload = {
        dosen_id: parseInt(selectedDosen),
        kelas_ids: selectedKelas.map(id => parseInt(id))
      }

      let endpoint = ''
      if (activeTab === 'pengajar') {
        payload.mata_kuliah_id = parseInt(selectedMatkul)
        endpoint = '/admin/assign-pengajar'
      } else {
        endpoint = '/admin/assign-pa'
      }

      const res = await api.post(endpoint, payload)
      toast.success(res.data.message || 'Pemberian tugas berhasil disimpan')
      
      // Reset selections
      setSelectedDosen('')
      setSelectedMatkul('')
      setSelectedKelas([])

    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  if (isFetching) {
    return <div className="p-8 text-center text-gray-500">Memuat data modul...</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Penugasan Dosen</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola penugasan dosen sebagai Pengajar Mata Kuliah dan Pembimbing Akademik kelas.
        </p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          className={`flex items-center gap-2 py-3 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === 'pengajar' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => { setActiveTab('pengajar'); setSelectedKelas([]); setSelectedMatkul(''); }}
        >
          <GraduationCap className="h-4 w-4" />
          Dosen Pengajar
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === 'pa' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => { setActiveTab('pa'); setSelectedKelas([]); }}
        >
          <Users className="h-4 w-4" />
          Pembimbing Akademik
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Form Penugasan {activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing Akademik'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                {/* Dosen Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pilih Dosen
                  </label>
                  <select
                    value={selectedDosen}
                    onChange={(e) => setSelectedDosen(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:text-slate-200"
                    required
                  >
                    <option value="">-- Pilih Dosen --</option>
                    {dosenList.map(dosen => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.user?.name} ({dosen.id_kerja})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mata Kuliah Selection (Pengajar Only) */}
                {activeTab === 'pengajar' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pilih Mata Kuliah
                    </label>
                    <select
                      value={selectedMatkul}
                      onChange={(e) => setSelectedMatkul(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:text-slate-200"
                      required
                    >
                      <option value="">-- Pilih Mata Kuliah --</option>
                      {matkulList.map(mk => (
                        <option key={mk.id} value={mk.id}>
                          {mk.kode} - {mk.nama} ({mk.sks} SKS)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Kelas Selection Multiple checkbox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Kelas (Bisa Lebih Dari Satu)
                </label>
                <div className="max-h-64 overflow-y-auto p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-2">
                  {kelasList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Data kelas kosong</p>
                  ) : (
                    kelasList.map(kelas => (
                      <label 
                        key={kelas.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedKelas.includes(kelas.id)
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40'
                            : 'border-transparent hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          checked={selectedKelas.includes(kelas.id)}
                          onChange={() => handleKelasToggle(kelas.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Kelas {kelas.nama_kelas}
                          </span>
                          <span className="text-xs text-gray-500">
                            {kelas.tahun_ajaran} - Semester {kelas.semester}
                          </span>
                        </div>
                        {selectedKelas.includes(kelas.id) && (
                          <CheckCircle className="h-4 w-4 text-brand-500 ml-auto" />
                        )}
                      </label>
                    ))
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>{selectedKelas.length} kelas dipilih</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedKelas([])}
                    className="text-red-500 hover:text-red-600"
                  >
                    Reset Pilihan
                  </button>
                </div>
              </div>

            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="submit" disabled={loading} isLoading={loading}>
                Simpan Penugasan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssignDosen
