import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Check, Search, ArrowLeft, Filter, Loader2, GraduationCap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import FilterBar from '../../components/ui/FilterBar'

const AssignMahasiswa = () => {
  const [searchParams] = useSearchParams()
  const defaultKelasId = searchParams.get('kelas_id') || ''
  const navigate = useNavigate()

  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [kelasList, setKelasList] = useState([])

  // Filters
  const [selectedFakultas, setSelectedFakultas] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedKategoriKelas, setSelectedKategoriKelas] = useState('')
  const [selectedKelasId, setSelectedKelasId] = useState(defaultKelasId)
  const [selectedKelasDetail, setSelectedKelasDetail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Mahasiswa data (server-side paginated)
  const [mahasiswaData, setMahasiswaData] = useState(null)
  const [mahasiswaLoading, setMahasiswaLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Assigned IDs
  const [assignedIds, setAssignedIds] = useState(new Set())

  const [loadingRef, setLoadingRef] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef(null)

  // Fetch reference data
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const res = await api.get('/admin/referensi/options')
        setFakultasList(res.data.fakultas || [])
      } catch { /* silent */ } finally {
        setLoadingRef(false)
      }
    }
    fetchRef()
  }, [])

  // Fakultas → fetch Prodi
  useEffect(() => {
    setProdiList([])
    setSelectedProdi('')
    setSelectedSemester('')
    setSelectedKategoriKelas('')
    setKelasList([])
    setSelectedKelasId('')
    setSelectedKelasDetail(null)
    if (!selectedFakultas) return
    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${selectedFakultas}`)
        setProdiList(res.data.data || res.data)
      } catch { /* silent */ }
    }
    fetchProdi()
  }, [selectedFakultas])

  // Prodi + Semester + Kategori → fetch Kelas
  useEffect(() => {
    setKelasList([])
    setSelectedKelasId('')
    setSelectedKelasDetail(null)
    if (!selectedProdi || !selectedSemester) return
    const fetchKelas = async () => {
      try {
        const params = new URLSearchParams({ per_page: '100', prodi_id: selectedProdi, semester: selectedSemester })
        if (selectedKategoriKelas) params.set('kategori_kelas', selectedKategoriKelas)
        const kelasData = res.data.data
        setKelasList(Array.isArray(kelasData) ? kelasData : kelasData?.data || [])
      } catch { /* silent */ }
    }
    fetchKelas()
  }, [selectedProdi, selectedSemester, selectedKategoriKelas])

  // When kelas selected → fetch kelas detail
  useEffect(() => {
    if (!selectedKelasId) {
      setSelectedKelasDetail(null)
      setAssignedIds(new Set())
      return
    }
    const fetchKelasDetail = async () => {
      try {
        const res = await api.get(`/admin/kelas/${selectedKelasId}`)
        setSelectedKelasDetail(res.data)
        const existIds = res.data.mahasiswa?.map(m => m.id) || []
        setAssignedIds(new Set(existIds))
      } catch {
        toast.error('Gagal memuat detail kelas')
      }
    }
    fetchKelasDetail()
  }, [selectedKelasId])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  // Fetch mahasiswa — show ALL by default (no kelas requirement)
  const fetchMahasiswa = useCallback(async () => {
    setMahasiswaLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage)
      params.set('per_page', pageSize)
      if (selectedProdi) params.set('prodi_id', selectedProdi)
      if (selectedFakultas) params.set('fakultas_id', selectedFakultas)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/mahasiswa?${params.toString()}`)
      setMahasiswaData(res.data.data)
    } catch {
      setMahasiswaData(null)
    } finally {
      setMahasiswaLoading(false)
    }
  }, [selectedProdi, selectedFakultas, currentPage, pageSize, debouncedSearch])

  useEffect(() => {
    fetchMahasiswa()
  }, [fetchMahasiswa])

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, selectedKelasId])

  const toggleAssign = (mhsId) => {
    setAssignedIds(prev => {
      const next = new Set(prev)
      next.has(mhsId) ? next.delete(mhsId) : next.add(mhsId)
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedKelasId) return
    setIsSaving(true)
    try {
      await api.post(`/admin/kelas/${selectedKelasId}/assign-mahasiswa`, {
        mahasiswa_ids: Array.from(assignedIds)
      })
      toast.success('Mahasiswa berhasil di-assign ke kelas')
      const res = await api.get(`/admin/kelas/${selectedKelasId}`)
      setSelectedKelasDetail(res.data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan assign mahasiswa'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const mahasiswaList = mahasiswaData?.data || []
  const totalItems = mahasiswaData?.total || 0
  const totalPages = mahasiswaData?.last_page || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/manajemen-kelas')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            Assign Mahasiswa ke Kelas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daftarkan mahasiswa peserta pada kelas yang dipilih.
          </p>
        </div>
      </div>

      {/* Cascading Filters — using reusable FilterBar */}
      <FilterBar
        fakultasList={fakultasList}
        prodiList={prodiList}
        kelasList={kelasList}
        selectedFakultas={selectedFakultas}
        selectedProdi={selectedProdi}
        selectedSemester={selectedSemester}
        selectedKategoriKelas={selectedKategoriKelas}
        selectedKelas={selectedKelasId}
        searchQuery={searchQuery}
        onFakultasChange={setSelectedFakultas}
        onProdiChange={setSelectedProdi}
        onSemesterChange={setSelectedSemester}
        onKategoriKelasChange={setSelectedKategoriKelas}
        onKelasChange={setSelectedKelasId}
        onSearchChange={setSearchQuery}
        loadingRef={loadingRef}
        showSemester={true}
        showKategoriKelas={true}
        showKelas={true}
        showSearch={true}
        searchPlaceholder="Cari NIM / Nama..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Kelas Info */}
        <div className="lg:col-span-1 space-y-6">
          {selectedKelasDetail ? (
            <Card className="bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800">
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase">Kelas Terpilih</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedKelasDetail.nama_kelas} - {selectedKelasDetail.mata_kuliah?.nama}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Semester {selectedKelasDetail.semester} — {selectedKelasDetail.kategori_kelas || 'Reguler Pagi'}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase">Dosen Pengajar</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{selectedKelasDetail.dosen?.user?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase">Total Peserta Dipilih</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{assignedIds.size} <span className="text-sm font-normal text-gray-500">Mahasiswa</span></div>
                </div>
                <div className="pt-4 border-t border-brand-200 dark:border-brand-700">
                  <Button className="w-full" onClick={handleSave} isLoading={isSaving} disabled={assignedIds.size === 0}>
                    Simpan Perubahan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <GraduationCap className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">Pilih Fakultas, Prodi, dan Kelas untuk memulai.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Mahasiswa List */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle>Daftar Mahasiswa</CardTitle>
            </CardHeader>
            <div className="flex-1 p-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto w-full p-4">
                  {mahasiswaLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse mr-3" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mahasiswaList.map((mhs) => {
                        const isSelected = assignedIds.has(mhs.id)
                        return (
                          <div
                            key={mhs.id}
                            onClick={() => selectedKelasId && toggleAssign(mhs.id)}
                            className={`flex items-center p-3 rounded-xl border transition-all ${
                              !selectedKelasId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              isSelected
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm ring-1 ring-brand-500'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${
                              isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{mhs.user?.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mhs.nim} — {mhs.prodi?.nama}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {!mahasiswaLoading && mahasiswaList.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      Tidak ada mahasiswa yang cocok.
                    </div>
                  )}
                </div>

                {!mahasiswaLoading && totalItems > 0 && (
                  <div className="border-t dark:border-gray-700">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AssignMahasiswa
