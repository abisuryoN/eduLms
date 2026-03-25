import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { Users, Loader2, MessageSquare, BookOpen, GraduationCap, Eye } from 'lucide-react'
import FilterBar from '../../components/ui/FilterBar'
import api from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const DataKelas = () => {
  const { user } = useAuth()
  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [semesterList, setSemesterList] = useState([])

  // Filters
  const [selectedFakultas, setSelectedFakultas] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedKategoriKelas, setSelectedKategoriKelas] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Data
  const [kelasData, setKelasData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingRef, setLoadingRef] = useState(true)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Debounce timer
  const debounceRef = useRef(null)

  // Fetch reference data (fakultas + semesters)
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const [resFak, resSem] = await Promise.all([
          api.get('/admin/referensi/options'),
          api.get('/admin/semester-list'),
        ])
        setFakultasList(resFak.data.data?.fakultas || [])
        setSemesterList(resSem.data.data || [])
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
    if (!selectedFakultas) return

    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${selectedFakultas}`)
        setProdiList(res.data.data?.data || res.data.data || [])
      } catch { /* silent */ }
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

  // Fetch kelas data (server-side)
  const fetchKelas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage)
      params.set('per_page', pageSize)
      if (selectedFakultas) params.set('fakultas_id', selectedFakultas)
      if (selectedProdi) params.set('prodi_id', selectedProdi)
      if (selectedSemester) params.set('semester', selectedSemester)
      if (selectedKategoriKelas) params.set('kategori_kelas', selectedKategoriKelas)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/kelas?${params.toString()}`)
      setKelasData(res.data.data)
    } catch {
      setKelasData(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, selectedFakultas, selectedProdi, selectedSemester, selectedKategoriKelas, debouncedSearch])

  useEffect(() => {
    fetchKelas()
  }, [fetchKelas])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedFakultas, selectedProdi, selectedSemester, selectedKategoriKelas, pageSize])

  const kelasList = kelasData?.data || []
  const totalItems = kelasData?.total || 0
  const totalPages = kelasData?.last_page || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            Data Kelas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daftar seluruh kelas, mata kuliah, pengajar, dan wali kelas (PA).
          </p>
        </div>
      </div>

      {/* Filters — using reusable FilterBar */}
      <FilterBar
        fakultasList={fakultasList}
        prodiList={prodiList}
        selectedFakultas={selectedFakultas}
        selectedProdi={selectedProdi}
        selectedSemester={selectedSemester}
        selectedKategoriKelas={selectedKategoriKelas}
        searchQuery={searchQuery}
        onFakultasChange={setSelectedFakultas}
        onProdiChange={setSelectedProdi}
        onSemesterChange={setSelectedSemester}
        onKategoriKelasChange={setSelectedKategoriKelas}
        onSearchChange={setSearchQuery}
        loadingRef={loadingRef}
        showSemester={true}
        showKategoriKelas={true}
        showKelas={false}
        showSearch={true}
        searchPlaceholder="Ketik nama kelas..."
      />

      {/* Table */}
      <Card>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kelas & Prodi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mata Kuliah & Pengajar</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dosen PA</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{width: j === 1 ? '70%' : '50%'}}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : kelasList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                      <GraduationCap className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      Tidak ada data kelas ditemukan.
                    </td>
                  </tr>
                ) : (
                  kelasList.map((kelas) => (
                    <tr key={kelas.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors align-top">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white text-base">{kelas.nama_kelas}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-tight">{kelas.prodi?.nama}</span>
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">{kelas.prodi?.fakultas?.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {kelas.teaching_assignments?.length > 0 ? (
                            kelas.teaching_assignments.map((ta) => (
                              <div key={ta.id} className="flex flex-col border-l-2 border-brand-200 dark:border-brand-800 pl-3">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                  {ta.mata_kuliah?.nama}
                                </span>
                                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1.5 mt-0.5">
                                  <Users className="w-3 h-3" /> {ta.dosen?.user?.name || '-'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">Belum ada pengajar.</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {kelas.pembimbing_akademik?.length > 0 ? (
                          <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                {kelas.pembimbing_akademik[0].dosen?.user?.name?.charAt(0)}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{kelas.pembimbing_akademik[0].dosen?.user?.name}</span>
                                <span className="text-[10px] text-gray-500">NIDN: {kelas.pembimbing_akademik[0].dosen?.id_kerja}</span>
                             </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum ada PA.</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                          SEMESTER {kelas.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                          {kelas.kategori_kelas || 'Reguler Pagi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Detail Kelas */}
                          <Link to={`/admin/kelas/${kelas.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-brand-600 border-brand-200 hover:bg-brand-50 dark:text-brand-400 dark:border-brand-800 dark:hover:bg-brand-900/30 rounded-xl flex items-center gap-1.5"
                              title="Detail Kelas"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Detail</span>
                            </Button>
                          </Link>

                          {/* Hubungi Kelas */}
                          {kelas.pembimbing_akademik && (
                            <Link to={`/${user?.role}/chat/kelas/${kelas.id}`}>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-100 dark:border-brand-800 rounded-xl flex items-center gap-1.5"
                                title="Hubungi Kelas via Chat"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">Chat</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
              <Loader2 className="h-3 w-3 animate-spin" /> Sedang memuat kelas...
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default DataKelas
