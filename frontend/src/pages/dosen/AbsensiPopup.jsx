import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const AbsensiPopup = ({ isOpen, onClose, kelasId, mataKuliah }) => {
  const [mahasiswa, setMahasiswa] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pertemuan, setPertemuan] = useState('1')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [statusMap, setStatusMap] = useState({}) // { mhsId: 'hadir'|'izin'|'alpha' }

  useEffect(() => {
    if (!isOpen || !kelasId) return

    const fetchMahasiswa = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/dosen/kelas/${kelasId}/mahasiswa`)
        const mhsList = res.data
        setMahasiswa(mhsList)
        
        // Initialize all as 'hadir'
        const initialMap = {}
        mhsList.forEach(m => {
          initialMap[m.id] = 'hadir'
        })
        setStatusMap(initialMap)
        
      } catch (error) {
        toast.error('Gagal mengambil daftar mahasiswa')
      } finally {
        setLoading(false)
      }
    }

    fetchMahasiswa()
  }, [isOpen, kelasId])

  const handleStatusChange = (mhsId, status) => {
    setStatusMap(prev => ({
      ...prev,
      [mhsId]: status
    }))
  }

  const handleSetAll = (status) => {
    const newMap = {}
    mahasiswa.forEach(m => {
      newMap[m.id] = status
    })
    setStatusMap(newMap)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (mahasiswa.length === 0) {
      toast.error('Tidak ada mahasiswa di kelas ini')
      return
    }

    const records = mahasiswa.map(m => ({
      mahasiswa_id: m.id,
      status: statusMap[m.id]
    }))

    setSubmitting(true)
    try {
      const res = await api.post(`/dosen/kelas/${kelasId}/absensi`, {
        pertemuan: parseInt(pertemuan),
        tanggal: tanggal,
        records: records
      })
      
      toast.success(res.data.message || 'Absensi berhasil disimpan')
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan absensi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Absensi: ${mataKuliah}`} maxWidth="max-w-4xl">
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-1">
              <Input
                label="Pertemuan Ke-"
                type="number"
                min="1"
                max="16"
                value={pertemuan}
                onChange={(e) => setPertemuan(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                label="Tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <h4 className="font-semibold text-gray-900">Daftar Mahasiswa</h4>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => handleSetAll('hadir')}>
                  Semua Hadir
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleSetAll('alpha')} className="text-red-600">
                  Semua Alpha
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIM</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Mahasiswa</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mahasiswa.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">
                        Belum ada mahasiswa yang terdaftar di kelas ini.
                      </td>
                    </tr>
                  ) : (
                    mahasiswa.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{m.nim}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.user?.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <label className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                              statusMap[m.id] === 'hadir' 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}>
                              <input 
                                type="radio" 
                                name={`status-${m.id}`} 
                                value="hadir" 
                                className="sr-only"
                                checked={statusMap[m.id] === 'hadir'}
                                onChange={() => handleStatusChange(m.id, 'hadir')}
                              />
                              Hadir
                            </label>
                            <label className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                              statusMap[m.id] === 'izin' 
                                ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}>
                              <input 
                                type="radio" 
                                name={`status-${m.id}`} 
                                value="izin" 
                                className="sr-only"
                                checked={statusMap[m.id] === 'izin'}
                                onChange={() => handleStatusChange(m.id, 'izin')}
                              />
                              Izin/Sakit
                            </label>
                            <label className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                              statusMap[m.id] === 'alpha' 
                                ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}>
                              <input 
                                type="radio" 
                                name={`status-${m.id}`} 
                                value="alpha" 
                                className="sr-only"
                                checked={statusMap[m.id] === 'alpha'}
                                onChange={() => handleStatusChange(m.id, 'alpha')}
                              />
                              Alpha
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" isLoading={submitting} disabled={mahasiswa.length === 0}>
              Simpan Absensi
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default AbsensiPopup
