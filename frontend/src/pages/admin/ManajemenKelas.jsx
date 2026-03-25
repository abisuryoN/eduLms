import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'
import FilterBar from '../../components/ui/FilterBar'

// Helper: persist/restore filter state
const STORAGE_KEY = 'manajemenKelas_filters'
const getPersisted = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
const setPersisted = (obj) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

const ManajemenKelas = () => {
  const navigate = useNavigate()
  const persisted = getPersisted()

  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [allProdiList, setAllProdiList] = useState([])

  // Filters — restored from localStorage
  const [filterFakultas, setFilterFakultas] = useState(persisted.fakultas || '')
  const [filterProdi, setFilterProdi] = useState(persisted.prodi || '')
  const [filterSemester, setFilterSemester] = useState(persisted.semester || '')
  const [filterKategori, setFilterKategori] = useState(persisted.kategori || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRef, setLoadingRef] = useState(true)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    prodi_id: '', nama_kelas: '', semester: '', tahun_ajaran: '', kategori_kelas: 'Reguler Pagi'
  })

  const debounceRef = useRef(null)

  // Persist filters to localStorage
  useEffect(() => {
    setPersisted({
      fakultas: filterFakultas,
      prodi: filterProdi,
      semester: filterSemester,
      kategori: filterKategori,
    })
  }, [filterFakultas, filterProdi, filterSemester, filterKategori])

  // Fetch reference data
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const [resFak, resProdi] = await Promise.all([
          api.get('/admin/referensi/options'),
          api.get('/admin/prodi'),
        ])
        setFakultasList(resFak.data.data?.fakultas || [])
        setAllProdiList(resProdi.data.data?.data || resProdi.data.data || [])
      } catch { /* silent */ } finally {
        setLoadingRef(false)
      }
    }
    fetchRef()
  }, [])

  // Filter prodi when fakultas changes
  useEffect(() => {
    if (!filterFakultas) {
      setProdiList([])
      return
    }
    setProdiList(allProdiList.filter(p => String(p.fakultas_id) === String(filterFakultas)))
  }, [filterFakultas, allProdiList])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  // Fetch kelas — show all by default
  const fetchKelas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ per_page: '200' })
      if (filterFakultas) params.set('fakultas_id', filterFakultas)
      if (filterProdi) params.set('prodi_id', filterProdi)
      if (filterSemester) params.set('semester', filterSemester)
      if (filterKategori) params.set('kategori_kelas', filterKategori)

      const res = await api.get(`/admin/kelas?${params.toString()}`)
      const data = res.data.data
      setKelasList(Array.isArray(data) ? data : data?.data || [])
    } catch {
      setKelasList([])
    } finally {
      setLoading(false)
    }
  }, [filterFakultas, filterProdi, filterSemester, filterKategori])

  useEffect(() => {
    fetchKelas()
  }, [fetchKelas])

  // Client-side search
  const filteredKelasList = useMemo(() => {
    if (!debouncedSearch) return kelasList
    const q = debouncedSearch.toLowerCase()
    return kelasList.filter(k =>
      k.nama_kelas?.toLowerCase().includes(q) ||
      k.tahun_ajaran?.toLowerCase().includes(q) ||
      k.prodi?.nama?.toLowerCase().includes(q)
    )
  }, [kelasList, debouncedSearch])

  const paginatedKelas = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredKelasList.slice(startIndex, startIndex + pageSize)
  }, [filteredKelasList, currentPage, pageSize])

  const totalPages = Math.ceil(filteredKelasList.length / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [filterFakultas, filterProdi, filterSemester, filterKategori, pageSize])

  const handleOpenModal = (mode, kelas = null) => {
    setModalMode(mode)
    if (mode === 'edit' && kelas) {
      setSelectedKelas(kelas)
      setFormData({
        prodi_id: kelas.prodi_id || '',
        nama_kelas: kelas.nama_kelas || '',
        semester: kelas.semester || '',
        tahun_ajaran: kelas.tahun_ajaran || '',
        kategori_kelas: kelas.kategori_kelas || 'Reguler Pagi',
      })
    } else {
      setSelectedKelas(null)
      setFormData({
        prodi_id: filterProdi || '',
        nama_kelas: '',
        semester: filterSemester || '',
        tahun_ajaran: '',
        kategori_kelas: filterKategori || 'Reguler Pagi',
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
      fetchKelas()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data kelas')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kelas ini?')) {
      try {
        await api.delete(`/admin/kelas/${id}`)
        toast.success('Kelas berhasil dihapus')
        fetchKelas()
      } catch (error) {
        toast.error('Gagal menghapus kelas')
      }
    }
  }

  const selectClass = 'block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 transition-colors disabled:opacity-50'

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2" title="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-brand-600 dark:text-brand-400" />
              Manajemen Kelas
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Buat, edit, dan kelola kelas per program studi.
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal('add')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kelas
        </Button>
      </div>

      {/* Filters — all rows shown, state persisted */}
      <FilterBar
        fakultasList={fakultasList}
        prodiList={prodiList}
        selectedFakultas={filterFakultas}
        selectedProdi={filterProdi}
        selectedSemester={filterSemester}
        selectedKategoriKelas={filterKategori}
        searchQuery={searchQuery}
        onFakultasChange={(v) => { setFilterFakultas(v); setFilterProdi(''); }}
        onProdiChange={setFilterProdi}
        onSemesterChange={setFilterSemester}
        onKategoriKelasChange={setFilterKategori}
        onSearchChange={setSearchQuery}
        loadingRef={loadingRef}
        showSemester={true}
        showKategoriKelas={true}
        showKelas={false}
        showSearch={true}
        searchPlaceholder="Cari nama kelas..."
        disableProdi={false}
      />

      <div className="flex justify-end text-sm text-gray-500 dark:text-gray-400">
        Menampilkan {filteredKelasList.length} kelas
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Nama Kelas</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Prodi</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">Semester</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">Kategori Kelas</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tahun Ajaran</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Memuat kelas...
                  </td>
                </tr>
              ) : paginatedKelas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada kelas ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedKelas.map((kelas) => (
                  <tr key={kelas.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                      {kelas.nama_kelas}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kelas.prodi?.nama || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                        SEM {kelas.semester}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                        {kelas.kategori_kelas || 'Reguler Pagi'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kelas.tahun_ajaran || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium space-x-2">
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
        {!loading && filteredKelasList.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredKelasList.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Kelas' : 'Edit Kelas'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi</label>
            <select className={selectClass} value={formData.prodi_id} onChange={(e) => setFormData({...formData, prodi_id: e.target.value})} required>
              <option value="" disabled>Pilih Program Studi...</option>
              {allProdiList.map(p => (
                <option key={p.id} value={p.id}>{p.nama} ({p.jenjang})</option>
              ))}
            </select>
          </div>

          <Input label="Nama Kelas" value={formData.nama_kelas} onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})} required placeholder="TIF-A" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
              <select className={selectClass} value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} required>
                <option value="" disabled>Pilih...</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <Input label="Tahun Ajaran" value={formData.tahun_ajaran} onChange={(e) => setFormData({...formData, tahun_ajaran: e.target.value})} required placeholder="2024/2025" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori Kelas</label>
            <select className={selectClass} value={formData.kategori_kelas} onChange={(e) => setFormData({...formData, kategori_kelas: e.target.value})} required>
              <option value="Reguler Pagi">Reguler Pagi</option>
              <option value="Reguler Sore">Reguler Sore</option>
              <option value="Karyawan">Karyawan</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManajemenKelas
