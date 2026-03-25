import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { Search, Users, Filter, Loader2, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import api from '../../lib/api'
import FilterBar from '../../components/ui/FilterBar'

const DataDosen = () => {
  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])

  // Filters
  const [selectedFakultas, setSelectedFakultas] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Data
  const [dosenData, setDosenData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingRef, setLoadingRef] = useState(true)

  // Expandable row state
  const [expandedRow, setExpandedRow] = useState(null)

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
        setFakultasList(res.data.data?.fakultas || res.data.fakultas || [])
      } catch (err) {
        console.error('Failed to fetch reference options', err)
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
    if (!selectedFakultas) return

    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${selectedFakultas}`)
        setProdiList(res.data.data?.data || res.data.data || [])
      } catch {
        // silent
      }
    }
    fetchProdi()
  }, [selectedFakultas])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  // Fetch dosen data (server-side)
  const fetchDosen = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage)
      params.set('per_page', pageSize)
      if (selectedFakultas) params.set('fakultas_id', selectedFakultas)
      if (selectedProdi) params.set('prodi_id', selectedProdi)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/dosen?${params.toString()}`)
      setDosenData(res.data.data)
    } catch {
      setDosenData(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, selectedFakultas, selectedProdi, debouncedSearch])

  useEffect(() => {
    fetchDosen()
  }, [fetchDosen])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedFakultas, selectedProdi, pageSize])

  const dosenList = dosenData?.data || []
  const totalItems = dosenData?.total || 0
  const totalPages = dosenData?.last_page || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-7 w-7 text-brand-600 dark:text-brand-400" />
          Data Dosen
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola dan lihat data dosen berdasarkan fakultas dan program studi.
        </p>
      </div>

      {/* Filters — using FilterBar */}
      <FilterBar
        fakultasList={fakultasList}
        prodiList={prodiList}
        selectedFakultas={selectedFakultas}
        selectedProdi={selectedProdi}
        searchQuery={searchQuery}
        onFakultasChange={setSelectedFakultas}
        onProdiChange={setSelectedProdi}
        onSearchChange={setSearchQuery}
        loadingRef={loadingRef}
        showSemester={false}
        showKategoriKelas={false}
        showKelas={false}
        showSearch={true}
        searchPlaceholder="Cari nama / NIDN..."
      />

      {/* Table */}
      <Card>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Dosen</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIDN</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fakultas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program Studi</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  // Skeleton loading
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{width: j === 1 ? '60%' : '40%'}}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : dosenList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Users className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">Tidak ada data dosen ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  dosenList.map((dosen, index) => {
                    const isExpanded = expandedRow === dosen.id
                    return (
                      <React.Fragment key={dosen.id}>
                        <tr 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                          onClick={() => setExpandedRow(isExpanded ? null : dosen.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold">
                            {dosen.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dosen.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {dosen.id_kerja || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {dosen.prodi?.fakultas?.nama || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {dosen.prodi?.nama || '-'}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                            {/* Pengajar Info */}
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-brand-600 dark:text-brand-400">
                                <BookOpen className="w-4 h-4" /> Dosen Pengajar
                              </div>
                              {dosen.teaching_assignments?.length > 0 ? (
                                <div className="space-y-2">
                                  {dosen.teaching_assignments.map((ta) => (
                                    <div key={ta.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                        {ta.mata_kuliah?.nama} <span className="text-xs text-gray-500 font-normal">({ta.mata_kuliah?.sks} SKS)</span>
                                      </div>
                                      <div className="flex gap-4 mt-1">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Kelas: <span className="font-medium">{ta.kelas?.nama_kelas}</span></div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Sem: <span className="font-medium">{ta.kelas?.semester}</span></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">Belum ada kelas yang diajar.</p>
                              )}
                            </div>

                            {/* PA Info */}
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                <Users className="w-4 h-4" /> Pembimbing Akademik (PA)
                              </div>
                              {dosen.pembimbing_akademik?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {dosen.pembimbing_akademik.map((pa) => (
                                    <div key={pa.id} className="inline-flex flex-col items-center justify-center p-2 px-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                      <span className="text-xs font-semibold">Kelas {pa.kelas?.nama_kelas}</span>
                                      <span className="text-[10px] opacity-80">Sem {pa.kelas?.semester}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">Belum ditugaskan sebagai PA.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

          {/* Loading indicator bar */}
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

export default DataDosen
