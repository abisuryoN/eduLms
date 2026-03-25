import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'
import FilterBar from '../../components/ui/FilterBar'

const JadwalAdmin = () => {
  const [jadwalList, setJadwalList] = useState([])
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

  // Cascading Filter State
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [kelasList, setKelasList] = useState([])

  const [filterFakultas, setFilterFakultas] = useState('')
  const [filterProdi, setFilterProdi] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [filterKategoriKelas, setFilterKategoriKelas] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)

  // Form cascading filters (for modal)
  const [formFakultasList, setFormFakultasList] = useState([])
  const [formProdiList, setFormProdiList] = useState([])
  const [formKelasList, setFormKelasList] = useState([])
  const [formFakultas, setFormFakultas] = useState('')
  const [formProdi, setFormProdi] = useState('')
  const [formSemester, setFormSemester] = useState('')
  const [formKategoriKelas, setFormKategoriKelas] = useState('')

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

  // Load reference data
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const res = await api.get('/admin/referensi/options')
        setFakultasList(res.data.data?.fakultas || [])
        setFormFakultasList(res.data.data?.fakultas || [])
      } catch (error) {
        console.error('Failed to load references', error)
      }
    }
    fetchRef()
  }, [])

  // Filter: Fakultas → Prodi
  useEffect(() => {
    setProdiList([])
    setFilterProdi('')
    setFilterSemester('')
    setFilterKategoriKelas('')
    setFilterKelas('')
    setKelasList([])
    if (!filterFakultas) return
    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${filterFakultas}`)
        setProdiList(res.data.data?.data || res.data.data || [])
      } catch { setProdiList([]) }
    }
    fetchProdi()
  }, [filterFakultas])

  // Filter: Prodi + Semester + Kategori → Kelas
  useEffect(() => {
    setKelasList([])
    setFilterKelas('')
    if (!filterProdi || !filterSemester) return
    const fetchKelas = async () => {
      try {
        const params = new URLSearchParams({
          fakultas_id: filterFakultas,
          prodi_id: filterProdi,
          semester: filterSemester,
          per_page: '100'
        })
        if (filterKategoriKelas) params.set('kategori_kelas', filterKategoriKelas)
        const res = await api.get(`/admin/kelas?${params.toString()}`)
        setKelasList(res.data.data?.data || res.data.data || [])
      } catch { }
    }
    fetchKelas()
  }, [filterProdi, filterSemester, filterFakultas, filterKategoriKelas])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  // Fetch jadwal — default show ALL, filter narrows down
  const fetchJadwal = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterFakultas) params.set('fakultas_id', filterFakultas)
      if (filterProdi) params.set('prodi_id', filterProdi)
      if (filterSemester) params.set('semester', filterSemester)
      if (filterKategoriKelas) params.set('kategori_kelas', filterKategoriKelas)
      if (filterKelas) params.set('kelas_id', filterKelas)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/jadwal?${params.toString()}`)
      const data = res.data.data
      setJadwalList(Array.isArray(data) ? data : data?.data || [])
    } catch (error) {
      toast.error('Gagal memuat data jadwal')
      setJadwalList([])
    } finally {
      setLoading(false)
    }
  }, [filterFakultas, filterProdi, filterSemester, filterKategoriKelas, filterKelas, debouncedSearch])

  useEffect(() => {
    fetchJadwal()
  }, [fetchJadwal])

  // Room Formatting Logic
  const formatRoom = (gedung, lantai, ruangan) => {
    if (!gedung && !lantai && !ruangan) return 'Online / TBA'
    return `R.${gedung || '?'}.${lantai || '?'}.${ruangan || '?'}`
  }

  // Client-side search on already-loaded data
  const filteredJadwal = useMemo(() => {
    if (!debouncedSearch) return jadwalList
    return jadwalList.filter(j =>
      j.hari?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      j.kelas?.nama_kelas?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      j.gedung?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      j.ruangan?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [jadwalList, debouncedSearch])

  const paginatedJadwal = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredJadwal.slice(startIndex, startIndex + pageSize)
  }, [filteredJadwal, currentPage, pageSize])

  const totalPages = Math.ceil(filteredJadwal.length / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  // --- Modal form cascading ---
  useEffect(() => {
    setFormProdiList([])
    setFormProdi('')
    setFormSemester('')
    setFormKategoriKelas('')
    setFormKelasList([])
    if (!formFakultas) return
    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${formFakultas}`)
        setFormProdiList(res.data.data?.data || res.data.data || [])
      } catch { setFormProdiList([]) }
    }
    fetchProdi()
  }, [formFakultas])

  useEffect(() => {
    setFormKelasList([])
    if (!formProdi || !formSemester) return
    const fetchKelas = async () => {
      try {
        const params = new URLSearchParams({
          prodi_id: formProdi,
          semester: formSemester,
          per_page: '100'
        })
        if (formKategoriKelas) params.set('kategori_kelas', formKategoriKelas)
        const res = await api.get(`/admin/kelas?${params.toString()}`)
        setFormKelasList(res.data.data?.data || res.data.data || [])
      } catch { }
    }
    fetchKelas()
  }, [formProdi, formSemester, formKategoriKelas])

  const handleOpenModal = (mode, jadwal = null) => {
    setModalMode(mode)
    if (mode === 'edit' && jadwal) {
      setSelectedJadwal(jadwal)
      setFormData({
        kelas_id: jadwal.kelas_id,
        hari: jadwal.hari,
        jam_mulai: jadwal.jam_mulai.substring(0, 5),
        jam_selesai: jadwal.jam_selesai.substring(0, 5),
        gedung: jadwal.gedung || '',
        lantai: jadwal.lantai || '',
        ruangan: jadwal.ruangan || '',
      })
      // Pre-fill form filters from existing jadwal
      setFormFakultas('')
      setFormProdi('')
      setFormSemester('')
      setFormKategoriKelas('')
    } else {
      setSelectedJadwal(null)
      setFormFakultas('')
      setFormProdi('')
      setFormSemester('')
      setFormKategoriKelas('')
      setFormData({
        kelas_id: '',
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
      fetchJadwal()
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
        fetchJadwal()
      } catch (error) {
        toast.error('Gagal menghapus jadwal')
      }
    }
  }

  const selectClass = 'block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 transition-colors disabled:opacity-50'

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            Jadwal Kuliah
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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

      {/* Filters — using reusable FilterBar */}
      <FilterBar
        fakultasList={fakultasList}
        prodiList={prodiList}
        kelasList={kelasList}
        selectedFakultas={filterFakultas}
        selectedProdi={filterProdi}
        selectedSemester={filterSemester}
        selectedKategoriKelas={filterKategoriKelas}
        selectedKelas={filterKelas}
        searchQuery={searchQuery}
        onFakultasChange={setFilterFakultas}
        onProdiChange={setFilterProdi}
        onSemesterChange={setFilterSemester}
        onKategoriKelasChange={setFilterKategoriKelas}
        onKelasChange={setFilterKelas}
        onSearchChange={setSearchQuery}
        showSemester={true}
        showKategoriKelas={true}
        showKelas={true}
        showSearch={true}
        searchPlaceholder="Cari dalam jadwal..."
      />

      <div className="flex justify-end text-sm text-gray-500 dark:text-gray-400">
        Menampilkan {filteredJadwal.length} jadwal
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
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">Kategori</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedJadwal.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada jadwal.'}
                  </td>
                </tr>
              ) : (
                paginatedJadwal.map((jadwal) => (
                  <tr key={jadwal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                      <div className="font-semibold text-brand-600 dark:text-brand-400">{jadwal.hari}</div>
                      <div className="text-gray-500 dark:text-gray-400">{jadwal.jam_mulai?.substring(0, 5)} - {jadwal.jam_selesai?.substring(0, 5)}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="font-medium text-gray-900 dark:text-gray-200">{jadwal.kelas?.mata_kuliah?.nama || '-'}</div>
                      <div className="text-xs">Kelas: {jadwal.kelas?.nama_kelas}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {jadwal.kelas?.teaching_assignments?.[0]?.dosen?.user?.name || jadwal.kelas?.dosen?.user?.name || '-'}
                      {jadwal.kelas?.teaching_assignments?.length > 1 && (
                        <span className="text-[10px] text-brand-500 block">+{jadwal.kelas.teaching_assignments.length - 1} dosen lainnya</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md inline-block">
                        {formatRoom(jadwal.gedung, jadwal.lantai, jadwal.ruangan)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                        {jadwal.kelas?.kategori_kelas || 'Reguler Pagi'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium space-x-2">
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

      {/* Add/Edit Modal — with cascading: Fakultas → Prodi → Semester → Kategori → Kelas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Jadwal Baru' : 'Edit Jadwal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalMode === 'add' && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pilih Kelas</p>
              {/* 1. Fakultas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fakultas</label>
                <select className={selectClass} value={formFakultas} onChange={(e) => setFormFakultas(e.target.value)}>
                  <option value="">-- Pilih Fakultas --</option>
                  {formFakultasList.map(f => <option key={f.id} value={f.id}>{f.nama}</option>)}
                </select>
              </div>
              {/* 2. Prodi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi</label>
                <select className={selectClass} value={formProdi} onChange={(e) => setFormProdi(e.target.value)} disabled={!formFakultas}>
                  <option value="">-- Pilih Prodi --</option>
                  {formProdiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              {/* 3. Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                <select className={selectClass} value={formSemester} onChange={(e) => setFormSemester(e.target.value)} disabled={!formProdi}>
                  <option value="">-- Pilih Semester --</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              {/* 4. Kategori Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori Kelas</label>
                <select className={selectClass} value={formKategoriKelas} onChange={(e) => setFormKategoriKelas(e.target.value)}>
                  <option value="">Semua Kategori</option>
                  <option value="Reguler Pagi">Reguler Pagi</option>
                  <option value="Reguler Sore">Reguler Sore</option>
                  <option value="Karyawan">Karyawan</option>
                </select>
              </div>
              {/* 5. Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas</label>
                <select
                  className={selectClass}
                  value={formData.kelas_id}
                  onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                  required
                  disabled={formKelasList.length === 0}
                >
                  <option value="" disabled>Pilih Kelas...</option>
                  {formKelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kelas}{k.mata_kuliah ? ` - ${k.mata_kuliah.nama}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {modalMode === 'edit' && (
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Kelas (terpilih)</label>
              <select className={selectClass} value={formData.kelas_id} onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })} required>
                <option value="" disabled>Pilih Kelas...</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}{k.mata_kuliah ? ` - ${k.mata_kuliah.nama}` : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Hari</label>
            <select className={selectClass} value={formData.hari} onChange={(e) => setFormData({ ...formData, hari: e.target.value })} required>
              {hariOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jam Mulai"
              type="time"
              value={formData.jam_mulai}
              onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
              required
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={formData.jam_selesai}
              onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Gedung" type="text" placeholder="Misal: 5" value={formData.gedung} onChange={(e) => setFormData({ ...formData, gedung: e.target.value })} />
            <Input label="Lantai" type="text" placeholder="Misal: 4" value={formData.lantai} onChange={(e) => setFormData({ ...formData, lantai: e.target.value })} />
            <Input label="Ruangan" type="text" placeholder="Misal: 2" value={formData.ruangan} onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })} />
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
