import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'

const ManajemenKelas = () => {
  const [kelasList, setKelasList] = useState([])
  const [dosenList, setDosenList] = useState([])
  const [matkulList, setMatkulList] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // add or edit
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Form State
  const [formData, setFormData] = useState({
    mata_kuliah_id: '',
    dosen_id: '',
    dosen_pa_id: '',
    nama_kelas: '',
    semester: '1',
    tahun_ajaran: '2023/2024',
  })

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [resKelas, resDosen, resMatkul] = await Promise.all([
        api.get('/admin/kelas'),
        api.get('/admin/dosen?per_page=1000'), // Simplification for demo
        api.get('/admin/mata-kuliah')
      ])
      
      setKelasList(resKelas.data.data || resKelas.data) 
      setDosenList(resDosen.data.data || resDosen.data)
      setMatkulList(resMatkul.data)
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Classroom Naming Logic: RA + Sem 6 -> R6A
  const formatClassName = (name, semester) => {
    if (!name) return '-'
    if (name.toUpperCase().startsWith('R') && name.length >= 2) {
      // If it matches pattern like RA, RB, etc.
      return `R${semester}${name.substring(1)}`
    }
    return name
  }

  // Client-side Filtering & Pagination
  const filteredKelas = useMemo(() => {
    return kelasList.filter(kelas => 
      kelas.nama_kelas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kelas.mata_kuliah?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kelas.dosen?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [kelasList, searchQuery])

  const paginatedKelas = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredKelas.slice(startIndex, startIndex + pageSize)
  }, [filteredKelas, currentPage, pageSize])

  const totalPages = Math.ceil(filteredKelas.length / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize])

  const handleOpenModal = (mode, kelas = null) => {
    setModalMode(mode)
    if (mode === 'edit' && kelas) {
      setSelectedKelas(kelas)
      setFormData({
        mata_kuliah_id: kelas.mata_kuliah_id,
        dosen_id: kelas.dosen_id,
        dosen_pa_id: kelas.dosen_pa_id || '',
        nama_kelas: kelas.nama_kelas,
        semester: kelas.semester,
        tahun_ajaran: kelas.tahun_ajaran,
      })
    } else {
      setSelectedKelas(null)
      setFormData({
        mata_kuliah_id: matkulList[0]?.id || '',
        dosen_id: dosenList[0]?.id || '',
        dosen_pa_id: '',
        nama_kelas: '',
        semester: '1',
        tahun_ajaran: '2023/2024',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (modalMode === 'add') {
        await api.post('/admin/kelas', formData)
        toast.success('Kelas berhasil dibuat')
      } else {
        await api.put(`/admin/kelas/${selectedKelas.id}`, formData)
        toast.success('Kelas berhasil diupdate')
      }
      setIsModalOpen(false)
      fetchAllData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan kelas')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kelas ini? Semua data terkait (jadwal, materi, nilai) juga akan terhapus.')) {
      try {
        await api.delete(`/admin/kelas/${id}`)
        toast.success('Kelas berhasil dihapus')
        fetchAllData()
      } catch (error) {
        toast.error('Gagal menghapus kelas')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola daftar kelas, tetapkan mata kuliah, dan dosen pengajar.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => handleOpenModal('add')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Kelas
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
            placeholder="Cari kelas, matkul, atau dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {filteredKelas.length} kelas
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Nama Kelas</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Mata Kuliah</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Dosen Pengajar</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Dosen PA</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tahun/Sem</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-48">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Memuat data...</td>
                </tr>
              ) : paginatedKelas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada kelas yang dibuat.'}
                  </td>
                </tr>
              ) : (
                paginatedKelas.map((kelas) => (
                  <tr key={kelas.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                      <div className="flex flex-col">
                        <span>{formatClassName(kelas.nama_kelas, kelas.semester)}</span>
                        <span className="text-[10px] text-gray-400 font-normal">Original: {kelas.nama_kelas}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="font-medium text-gray-900 dark:text-gray-200">{kelas.mata_kuliah?.nama || '-'}</div>
                      <div className="text-xs">{kelas.mata_kuliah?.sks} SKS • {kelas.mata_kuliah?.kode}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kelas.dosen?.user?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kelas.dosen_pa?.user?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kelas.tahun_ajaran} (Sem {kelas.semester})
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium space-x-2">
                      <Link to={`/admin/assign-mahasiswa?kelas_id=${kelas.id}`}>
                        <Button variant="secondary" size="sm" title="Assign Mahasiswa">
                          <Users className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenModal('edit', kelas)}>
                        <Edit2 className="w-4 h-4 text-brand-600" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(kelas.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredKelas.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredKelas.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Kelas Baru' : 'Edit Kelas'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kelas"
            type="text"
            value={formData.nama_kelas}
            onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})}
            placeholder="Misal: TI-A Malam"
            required
          />

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Mata Kuliah</label>
            <select
              className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
              value={formData.mata_kuliah_id}
              onChange={(e) => setFormData({...formData, mata_kuliah_id: e.target.value})}
              required
            >
              <option value="" disabled className="dark:bg-gray-800">Pilih Mata Kuliah...</option>
              {matkulList.map(mk => (
                <option key={mk.id} value={mk.id} className="dark:bg-gray-800">{mk.kode} - {mk.nama} ({mk.sks} SKS)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Dosen Pengajar</label>
            <select
              className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
              value={formData.dosen_id}
              onChange={(e) => setFormData({...formData, dosen_id: e.target.value})}
              required
            >
              <option value="" disabled className="dark:bg-gray-800">Pilih Dosen Pengajar...</option>
              {dosenList.map(dosen => (
                <option key={dosen.id} value={dosen.id} className="dark:bg-gray-800">{dosen.user?.name} ({dosen.id_kerja})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Dosen Pengampu Akademik (PA)</label>
            <select
              className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
              value={formData.dosen_pa_id}
              onChange={(e) => setFormData({...formData, dosen_pa_id: e.target.value})}
            >
              <option value="" className="dark:bg-gray-800">Belum Ada / Plih Dosen PA...</option>
              {dosenList.map(dosen => (
                <option key={`pa-${dosen.id}`} value={dosen.id} className="dark:bg-gray-800">{dosen.user?.name} ({dosen.id_kerja})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tahun Ajaran"
              type="text"
              value={formData.tahun_ajaran}
              onChange={(e) => setFormData({...formData, tahun_ajaran: e.target.value})}
              placeholder="2023/2024"
              required
            />
            <Input
              label="Semester"
              type="number"
              min="1"
              max="14"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
              required
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

export default ManajemenKelas
