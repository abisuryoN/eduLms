import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Calendar, BookOpen } from 'lucide-react'
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
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedClassDetail, setSelectedClassDetail] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

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
    // Relaxed guard: fetch if at least one filter is active
    if (!formFakultas && !formProdi && !formSemester && !formKategoriKelas) return
    
    const fetchKelas = async () => {
      console.log('FETCHING KELAS WITH FILTERS:', { 
        fakultas: formFakultas, 
        prodi: formProdi, 
        semester: formSemester, 
        kategori: formKategoriKelas 
      })
      try {
        const params = {
          fakultas_id: formFakultas,
          prodi_id: formProdi,
          semester: formSemester,
          kategori: formKategoriKelas,
          all: 1
        }
        const res = await api.get('/admin/kelas', { params })
        console.log('FETCH KELAS RESULT:', res.data.data)
        setFormKelasList(res.data.data || [])
      } catch (error) {
        console.error('Failed to fetch classes for form', error)
      }
    }
    fetchKelas()
  }, [formFakultas, formProdi, formSemester, formKategoriKelas])

  const handleOpenModal = (mode, jadwal = null) => {
    setModalMode(mode)
    setCurrentStep(1)
    setSelectedClassDetail(null)
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
      // Fetch detail for edit mode too
      fetchClassDetail(jadwal.kelas_id)
      
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

  const fetchClassDetail = async (classId) => {
    if (!classId) return
    setIsLoadingDetail(true)
    try {
      const res = await api.get(`/admin/kelas/${classId}`)
      setSelectedClassDetail(res.data.data)
    } catch (error) {
      toast.error('Gagal memuat detail kelas')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleSelectClass = (classId) => {
    setFormData({ ...formData, kelas_id: classId })
    fetchClassDetail(classId)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.kelas_id) {
        toast.error('Silakan pilih kelas terlebih dahulu')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
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

  const selectClass = 'block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2 px-3 transition-colors disabled:opacity-50 max-h-52 overflow-y-auto'

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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors font-bold text-sm ${
                  currentStep === s 
                    ? 'border-brand-600 bg-brand-600 text-white' 
                    : currentStep > s 
                      ? 'border-brand-600 bg-brand-50 text-brand-600' 
                      : 'border-gray-200 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > s ? 'bg-brand-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: Filter & Pilih Kelas */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="relative z-50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fakultas</label>
                  <select className={selectClass} value={formFakultas} onChange={(e) => setFormFakultas(e.target.value)} disabled={modalMode === 'edit'}>
                    <option value="">-- Semua Fakultas --</option>
                    {formFakultasList.map(f => <option key={f.id} value={f.id}>{f.nama}</option>)}
                  </select>
                </div>
                <div className="relative z-50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Program Studi</label>
                  <select className={selectClass} value={formProdi} onChange={(e) => setFormProdi(e.target.value)} disabled={!formFakultas || modalMode === 'edit'}>
                    <option value="">-- Semua Prodi --</option>
                    {formProdiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div className="relative z-50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Semester</label>
                  <select className={selectClass} value={formSemester} onChange={(e) => setFormSemester(e.target.value)} disabled={modalMode === 'edit'}>
                    <option value="">-- Semua Semester --</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="relative z-50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kategori Kelas</label>
                  <select className={selectClass} value={formKategoriKelas} onChange={(e) => setFormKategoriKelas(e.target.value)} disabled={modalMode === 'edit'}>
                    <option value="">Semua Kategori</option>
                    <option value="Reguler Pagi">Reguler Pagi</option>
                    <option value="Reguler Sore">Reguler Sore</option>
                    <option value="Karyawan">Karyawan</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 relative z-50">
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Pilih Kelas <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    id="kelas-select"
                    className={`${selectClass} truncate md:whitespace-normal md:break-words`}
                    value={formData.kelas_id}
                    onChange={(e) => handleSelectClass(e.target.value)}
                    required
                    disabled={modalMode === 'edit'}
                  >
                    <option value="" disabled>-- Klik untuk memilih kelas --</option>
                    {(modalMode === 'edit' ? [selectedJadwal?.kelas].filter(Boolean) : formKelasList).map(k => (
                      <option key={k.id} value={k.id} className="py-2">
                        {k.nama_kelas} - {k.mata_kuliah?.nama || 'Tanpa Matkul'}
                      </option>
                    ))}
                  </select>
                </div>
                {formKelasList.length === 0 && modalMode === 'add' && formProdi && formSemester && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg italic">Tidak ada kelas yang ditemukan untuk filter ini.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Info Matkul & Dosen */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-brand-50 border border-brand-100 dark:bg-brand-900/20 dark:border-brand-900/30 p-4 rounded-2xl">
                  <h3 className="font-bold text-brand-900 dark:text-brand-300 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Detail Pelajaran di Kelas
                  </h3>
                  
                  {isLoadingDetail ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                    </div>
                  ) : selectedClassDetail?.teaching_assignments?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedClassDetail.teaching_assignments.map((ta, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{ta.mata_kuliah?.nama || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            Dosen: <span className="font-medium text-gray-700 dark:text-gray-200">{ta.dosen?.user?.name || '-'}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-gray-500 text-sm italic">
                      Belum ada mata kuliah yang di-assign ke kelas ini.
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* STEP 3: Input Jadwal */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Hari</label>
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
                <Input label="Gedung" type="text" placeholder="Gedung" value={formData.gedung} onChange={(e) => setFormData({ ...formData, gedung: e.target.value })} />
                <Input label="Lantai" type="text" placeholder="Lantai" value={formData.lantai} onChange={(e) => setFormData({ ...formData, lantai: e.target.value })} />
                <Input label="Ruangan" type="text" placeholder="Ruang" value={formData.ruangan} onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })} />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between gap-3 pt-6 border-t dark:border-gray-800">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={handleBack} disabled={isSubmitting}>
                Kembali
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button type="button" id="next-btn" onClick={handleNext} className="flex items-center gap-2">
                Next <Plus className="w-4 h-4 rotate-45" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                {modalMode === 'add' ? 'Tambah Jadwal' : 'Simpan Perubahan'}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default JadwalAdmin
