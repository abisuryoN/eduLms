import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { GraduationCap, Loader2 } from 'lucide-react'
import FilterBar from '../../components/ui/FilterBar'
import api from '../../lib/api'

const DataMahasiswa = () => {
  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [kelasList, setKelasList] = useState([])

  // Filters
  const [selectedFakultas, setSelectedFakultas] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('')
  const [selectedKategoriKelas, setSelectedKategoriKelas] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Data
  const [mahasiswaData, setMahasiswaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingRef, setLoadingRef] = useState(true)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Debounce timer
  const debounceRef = useRef(null)

  // Fetch reference data (fakultas)
  useEffect(() => {
    const fetchRef = async () => {
      try {
        setFakultasList(res.data.data?.fakultas || [])
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
    setKelasList([])
    setSelectedKelas('')
    if (!selectedFakultas) return

    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${selectedFakultas}`)
        setProdiList(res.data.data?.data || res.data.data || [])
      } catch { /* silent */ }
    }
    fetchProdi()
  }, [selectedFakultas])

  // When prodi changes → fetch kelas
  useEffect(() => {
    setKelasList([])
    setSelectedKelas('')
    if (!selectedProdi) return

    const fetchKelas = async () => {
      try {
        const params = new URLSearchParams({ per_page: '100', prodi_id: selectedProdi })
        if (selectedKategoriKelas) params.set('kategori_kelas', selectedKategoriKelas)
        const res = await api.get(`/admin/kelas?${params.toString()}`)
        const allKelas = res.data.data?.data || res.data.data || []
        setKelasList(allKelas)
      } catch { /* silent */ }
    }
    fetchKelas()
  }, [selectedProdi, selectedKategoriKelas])

  // Auto reset page
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedFakultas, selectedProdi, selectedKategoriKelas, selectedKelas, pageSize])

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
      if (selectedKategoriKelas) params.set('kategori_kelas', selectedKategoriKelas)
      if (selectedKelas) params.set('kelas_id', selectedKelas)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/mahasiswa?${params.toString()}`)
      setMahasiswaData(res.data.data)
    } catch {
      setMahasiswaData(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, selectedFakultas, selectedProdi, selectedKategoriKelas, selectedKelas, debouncedSearch])

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

      {/* Filters — using reusable FilterBar */}
      <FilterBar
        fakultasList={fakultasList}
        prodiList={prodiList}
        kelasList={kelasList}
        selectedFakultas={selectedFakultas}
        selectedProdi={selectedProdi}
        selectedKategoriKelas={selectedKategoriKelas}
        selectedKelas={selectedKelas}
        searchQuery={searchQuery}
        onFakultasChange={setSelectedFakultas}
        onProdiChange={setSelectedProdi}
        onKategoriKelasChange={setSelectedKategoriKelas}
        onKelasChange={setSelectedKelas}
        onSearchChange={setSearchQuery}
        loadingRef={loadingRef}
        showSemester={false}
        showKategoriKelas={true}
        showKelas={true}
        showSearch={true}
        searchPlaceholder="Cari nama / NIM..."
      />

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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori Kelas</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: j === 1 ? '60%' : '40%' }}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : mahasiswaList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                          {mhs.kelas?.length > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                              {mhs.kelas.map(k => k.kategori_kelas || 'Reguler Pagi').join(', ')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
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
