import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'

const JadwalAdmin = () => {
  const [jadwalList, setJadwalList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedJadwal, setSelectedJadwal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [formData, setFormData] = useState({
    kelas_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '09:40',
    gedung: '',
    lantai: '',
    ruangan: '',
  })

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [resJadwal, resKelas] = await Promise.all([
        api.get('/admin/jadwal'),
        api.get('/admin/kelas?per_page=1000') // Simplification
      ])
      
      setJadwalList(resJadwal.data)
      setKelasList(resKelas.data.data || resKelas.data)
    } catch (error) {
      toast.error('Gagal memuat data jadwal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Room Formatting Logic: R.[Gedung].[Lantai].[Ruangan]
  const formatRoom = (gedung, lantai, ruangan) => {
    if (!gedung && !lantai && !ruangan) return 'Online / TBA'
    const g = gedung || '?'
    const l = lantai || '?'
    const r = ruangan || '?'
    return `R.${g}.${l}.${r}`
  }

  // Client-side Filtering & Pagination
  const filteredJadwal = useMemo(() => {
    return jadwalList.filter(j => 
      j.hari?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.kelas?.mata_kuliah?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.kelas?.nama_kelas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.kelas?.dosen?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.gedung?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.ruangan?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [jadwalList, searchQuery])

  const paginatedJadwal = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredJadwal.slice(startIndex, startIndex + pageSize)
  }, [filteredJadwal, currentPage, pageSize])

  const totalPages = Math.ceil(filteredJadwal.length / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize])

  const handleOpenModal = (mode, jadwal = null) => {
    setModalMode(mode)
    if (mode === 'edit' && jadwal) {
      setSelectedJadwal(jadwal)
      setFormData({
        kelas_id: jadwal.kelas_id,
        hari: jadwal.hari,
        jam_mulai: jadwal.jam_mulai.substring(0, 5), // Format HH:mm
        jam_selesai: jadwal.jam_selesai.substring(0, 5),
        gedung: jadwal.gedung || '',
        lantai: jadwal.lantai || '',
        ruangan: jadwal.ruangan || '',
      })
    } else {
      setSelectedJadwal(null)
      setFormData({
        kelas_id: kelasList[0]?.id || '',
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '09:40',
        gedung: '',
        lantai: '',
        ruangan: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (modalMode === 'add') {
        await api.post('/admin/jadwal', formData)
        toast.success('Jadwal berhasil ditambah')
      } else {
        await api.put(`/admin/jadwal/${selectedJadwal.id}`, formData)
        toast.success('Jadwal berhasil diupdate')
      }
      setIsModalOpen(false)
      fetchAllData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan jadwal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      try {
        await api.delete(`/admin/jadwal/${id}`)
        toast.success('Jadwal berhasil dihapus')
        fetchAllData()
      } catch (error) {
        toast.error('Gagal menghapus jadwal')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Kuliah</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola jadwal pertemuan untuk setiap kelas.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => handleOpenModal('add')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-colors"
            placeholder="Cari hari, matkul, kelas, atau dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {filteredJadwal.length} jadwal
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Hari & Waktu</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Kelas / Matkul</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Dosen</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Lokasi</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Memuat data...</td>
                </tr>
              ) : paginatedJadwal.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada jadwal yang dibuat.'}
                  </td>
                </tr>
              ) : (
                paginatedJadwal.map((jadwal) => (
                  <tr key={jadwal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                      <div className="font-semibold text-brand-600 dark:text-brand-400">{jadwal.hari}</div>
                      <div className="text-gray-500 dark:text-gray-400">{jadwal.jam_mulai.substring(0,5)} - {jadwal.jam_selesai.substring(0,5)}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="font-medium text-gray-900 dark:text-gray-200">{jadwal.kelas?.mata_kuliah?.nama || '-'}</div>
                      <div className="text-xs">Kelas: {jadwal.kelas?.nama_kelas}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {jadwal.kelas?.dosen?.user?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md inline-block">
                        {formatRoom(jadwal.gedung, jadwal.lantai, jadwal.ruangan)}
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenModal('edit', jadwal)}>
                        <Edit2 className="w-4 h-4 text-brand-600" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(jadwal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredJadwal.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredJadwal.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Jadwal Baru' : 'Edit Jadwal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Pilih Kelas</label>
            <select
              className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
              value={formData.kelas_id}
              onChange={(e) => setFormData({...formData, kelas_id: e.target.value})}
              required
            >
              <option value="" disabled className="dark:bg-gray-800">Pilih Kelas...</option>
              {kelasList.map(k => (
                <option key={k.id} value={k.id} className="dark:bg-gray-800">{k.mata_kuliah?.nama} - {k.nama_kelas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Hari</label>
            <select
              className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
              value={formData.hari}
              onChange={(e) => setFormData({...formData, hari: e.target.value})}
              required
            >
              {hariOptions.map(h => (
                <option key={h} value={h} className="dark:bg-gray-800">{h}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jam Mulai"
              type="time"
              value={formData.jam_mulai}
              onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})}
              required
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={formData.jam_selesai}
              onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Gedung"
              type="text"
              placeholder="Misal: 5"
              value={formData.gedung}
              onChange={(e) => setFormData({...formData, gedung: e.target.value})}
            />
            <Input
              label="Lantai"
              type="text"
              placeholder="Misal: 4"
              value={formData.lantai}
              onChange={(e) => setFormData({...formData, lantai: e.target.value})}
            />
            <Input
              label="Ruangan"
              type="text"
              placeholder="Misal: 2"
              value={formData.ruangan}
              onChange={(e) => setFormData({...formData, ruangan: e.target.value})}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default JadwalAdmin
