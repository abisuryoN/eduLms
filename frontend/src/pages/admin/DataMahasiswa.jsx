import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { Search, GraduationCap, Filter, Loader2 } from 'lucide-react'
import api from '../../lib/api'

const DataMahasiswa = () => {
  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [kelasList, setKelasList] = useState([])

  // Filters
  const [selectedFakultas, setSelectedFakultas] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Data
  const [mahasiswaData, setMahasiswaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingRef, setLoadingRef] = useState(true)
  const [selectedKelasDetail, setSelectedKelasDetail] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Debounce timer
  const debounceRef = useRef(null)

  // Fetch reference data (fakultas)
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const res = await api.get('/admin/referensi/options')
        setFakultasList(res.data.fakultas || [])
      } catch {
        // silent
      } finally {
        setLoadingRef(false)
      }
    }
    fetchRef()
  }, [])

  // When fakultas changes → fetch prodi
  useEffect(() => {
    setProdiList([])
    setSelectedProdi('')
    setSelectedSemester('')
    setKelasList([])
    setSelectedKelas('')
    if (!selectedFakultas) return

    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${selectedFakultas}`)
        setProdiList(res.data.data || res.data)
      } catch { /* silent */ }
    }
    fetchProdi()
  }, [selectedFakultas])

  // When prodi or semester changes → fetch kelas
  useEffect(() => {
    setKelasList([])
    setSelectedKelas('')
    if (!selectedProdi || !selectedSemester) return

    const fetchKelas = async () => {
      try {
        const res = await api.get(`/admin/kelas?per_page=100&prodi_id=${selectedProdi}&semester=${selectedSemester}`)
        const allKelas = res.data.data || res.data
        setKelasList(allKelas)
      } catch { /* silent */ }
    }
    fetchKelas()
  }, [selectedProdi, selectedSemester])

  // Auto reset page
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedFakultas, selectedProdi, selectedSemester, selectedKelas, pageSize])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  // Fetch mahasiswa data (server-side)
  const fetchMahasiswa = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage)
      params.set('per_page', pageSize)
      if (selectedFakultas) params.set('fakultas_id', selectedFakultas)
      if (selectedProdi) params.set('prodi_id', selectedProdi)
      if (selectedSemester) params.set('semester', selectedSemester)
      if (selectedKelas) params.set('kelas_id', selectedKelas)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/mahasiswa?${params.toString()}`)
      setMahasiswaData(res.data)
    } catch {
      setMahasiswaData(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, selectedFakultas, selectedProdi, selectedSemester, selectedKelas, debouncedSearch])

  useEffect(() => {
    fetchMahasiswa()
  }, [fetchMahasiswa])



  const mahasiswaList = mahasiswaData?.data || []
  const totalItems = mahasiswaData?.total || 0
  const totalPages = mahasiswaData?.last_page || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-brand-600 dark:text-brand-400" />
          Data Mahasiswa
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola dan lihat data mahasiswa berdasarkan fakultas, program studi, dan kelas.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Filter className="h-4 w-4" /> Filter Data
            </div>

            {/* Fakultas */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fakultas</label>
              <select
                value={selectedFakultas}
                onChange={(e) => setSelectedFakultas(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                disabled={loadingRef}
              >
                <option value="">Semua Fakultas</option>
                {fakultasList.map(f => (
                  <option key={f.id} value={f.id}>{f.nama}</option>
                ))}
              </select>
            </div>

            {/* Prodi */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Program Studi</label>
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                disabled={!selectedFakultas}
              >
                <option value="">Semua Prodi</option>
                {prodiList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </div>

            {/* Semester Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                disabled={!selectedProdi}
              >
                <option value="">Semua Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                disabled={!selectedProdi || !selectedSemester}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama / NIM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fakultas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prodi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori Kelas</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: j === 1 ? '60%' : '40%' }}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : mahasiswaList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <GraduationCap className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">Tidak ada data mahasiswa ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  mahasiswaList.map((mhs, index) => {
                    const kelasNames = mhs.kelas?.map(k => k.nama_kelas).join(', ') || '-'
                    return (
                      <tr key={mhs.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                              {mhs.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{mhs.user?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                          {mhs.nim || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {mhs.prodi?.fakultas?.nama || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {mhs.prodi?.nama || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {kelasNames}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                            {mhs.semester || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {mhs.kelas?.map(k => k.kategori_kelas).join(', ') || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          )}

          {loading && (
            <div className="flex items-center justify-center py-2 text-xs text-gray-400 gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Memuat data...
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default DataMahasiswa
