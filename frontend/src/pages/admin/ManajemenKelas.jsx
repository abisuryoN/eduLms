import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { ModalKelasForm } from './ModalKelasForm'

const ManajemenKelas = () => {
  const [kelasData, setKelasData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalAddOpen, setIsModalAddOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Cascading Filters State
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [filterFakultas, setFilterFakultas] = useState('')
  const [filterProdi, setFilterProdi] = useState('')
  const [semesterList, setSemesterList] = useState([])
  const [filterSemester, setFilterSemester] = useState('')


  useEffect(() => {
    const fetchRef = async () => {
      try {
        const resRef = await api.get('/admin/referensi/options')
        setFakultasList(resRef.data.fakultas || [])
        setSemesterList([1, 2, 3, 4, 5, 6, 7, 8])
      } catch (error) {
        console.error('Failed to load references', error)
      }
    }
    fetchRef()
  }, [])

  useEffect(() => {
    // When Fakultas changes, load Prodi and reset others
    if (!filterFakultas) {
      setProdiList([])
      setFilterProdi('')
      setFilterSemester('')
      setKelasData(null) // Clear data if filter incomplete
      return
    }

    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${filterFakultas}`)
        setProdiList(res.data.data || [])
        setFilterProdi('')
        setFilterSemester('')
      } catch (error) {
        console.error('Failed to load prodi', error)
      }
    }
    fetchProdi()
  }, [filterFakultas])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchKelasData = async () => {
    // "Jangan load semua data di awal. Kelas muncul setelah Fakultas & Prodi lengkap"
    if (!filterFakultas || !filterProdi) {
      setKelasData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage)
      params.set('per_page', pageSize)
      params.set('fakultas_id', filterFakultas)
      params.set('prodi_id', filterProdi)
      if (filterSemester) params.set('semester', filterSemester)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await api.get(`/admin/kelas?${params.toString()}`)
      setKelasData(res.data)
    } catch (error) {
      toast.error('Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelasData()
  }, [currentPage, pageSize, debouncedSearch, filterFakultas, filterProdi, filterSemester])

  // Classroom Naming Logic: RA + Sem 6 -> R6A
  const formatClassName = (name, semester) => {
    if (!name) return '-'
    if (name.toUpperCase().startsWith('R') && name.length >= 2) {
      return `R${semester}${name.substring(1)}`
    }
    return name
  }

  const kelasList = kelasData?.data || []
  const totalItems = kelasData?.total || 0
  const totalPages = kelasData?.last_page || 1

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kelas ini? Semua data terkait (jadwal, materi, nilai) juga akan terhapus.')) {
      try {
        await api.delete(`/admin/kelas/${id}`)
        toast.success('Kelas berhasil dihapus')
        fetchKelasData()
      } catch (error) {
        toast.error('Gagal menghapus kelas')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manajemen Kelas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola daftar kelas, tetapkan mata kuliah, dan dosen pengajar.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setIsModalAddOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Kelas (Dinamis)
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Fitur Cascading Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fakultas *</label>
            <select
              className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl sm:text-sm focus:ring-brand-500 focus:border-brand-500"
              value={filterFakultas}
              onChange={(e) => setFilterFakultas(e.target.value)}
            >
              <option value="">-- Pilih Fakultas --</option>
              {fakultasList.map(f => (
                <option key={f.id} value={f.id}>{f.kode} - {f.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prodi *</label>
            <select
              className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl sm:text-sm focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value)}
              disabled={!filterFakultas}
            >
              <option value="">-- Pilih Prodi --</option>
              {Array.isArray(prodiList) && prodiList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.kode} - {p.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Semester *</label>
            <select
              className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl sm:text-sm focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              disabled={!filterProdi}
            >
              <option value="">-- Pilih Semester --</option>
              {semesterList.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cari Spesifik</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Nama kelas / dosen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!filterProdi}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {totalItems} kelas
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Nama Kelas & Prodi</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Mata Kuliah</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Dosen Pengajar</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Dosen PA</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tahun/Sem</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-48">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {(!filterFakultas || !filterProdi) ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      Silakan pilih Fakultas dan Prodi terlebih dahulu untuk melihat daftar kelas.
                    </td>
                  </tr>
                ) : kelasList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada kelas yang dibuat pada prodi ini.'}
                    </td>
                  </tr>
                ) : (
                  kelasList.map((kelas) => (
                    <tr key={kelas.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                        <div className="flex flex-col">
                          <span>{formatClassName(kelas.nama_kelas, kelas.semester)}</span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">{kelas.kategori_kelas || 'Regular Pagi'}</span>
                          {kelas.prodi && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal mt-0.5">Prodi: {kelas.prodi.nama}</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {kelas.teaching_assignments?.length > 0 ? (
                          <>
                            <div className="font-medium text-gray-900 dark:text-gray-200">{kelas.teaching_assignments[0].mata_kuliah?.nama || '-'}</div>
                            <div className="text-xs">{kelas.teaching_assignments[0].mata_kuliah?.sks} SKS • {kelas.teaching_assignments[0].mata_kuliah?.kode}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900 dark:text-gray-200">{kelas.mata_kuliah?.nama || '-'}</div>
                            <div className="text-xs">{kelas.mata_kuliah?.sks} SKS • {kelas.mata_kuliah?.kode}</div>
                          </>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {kelas.teaching_assignments?.length > 0
                          ? (kelas.teaching_assignments[0].dosen?.user?.name || '-')
                          : (kelas.dosen?.user?.name || '-')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {kelas.pembimbing_akademik?.length > 0
                          ? (kelas.pembimbing_akademik[0].dosen?.user?.name || '-')
                          : (kelas.dosenPA?.user?.name || '-')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {kelas.tahun_ajaran} (Sem {kelas.semester})
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium space-x-2">
                        <Link to={`/admin/kelas/${kelas.id}`}>
                          <Button variant="outline" size="sm" title="Lihat Detail Kelas" className="text-brand-600 border-brand-200 hover:bg-brand-50">
                            Detail
                          </Button>
                        </Link>
                        <Link to={`/admin/assign-mahasiswa?kelas_id=${kelas.id}`}>
                          <Button variant="secondary" size="sm" title="Assign Mahasiswa">
                            <Users className="w-4 h-4" />
                          </Button>
                        </Link>
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
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </Card>
      )}

      {/* Form Modal Add Dinamis */}
      <ModalKelasForm
        isOpen={isModalAddOpen}
        onClose={() => setIsModalAddOpen(false)}
        onSuccess={fetchKelasData}
      />
    </div>
  )
}

export default ManajemenKelas
