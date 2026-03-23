import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { ModalKelasForm } from './ModalKelasForm'

const ManajemenKelas = () => {
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalAddOpen, setIsModalAddOpen] = useState(false)
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchKelasData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/kelas')
      // Handling pagination structure vs flat array structure
      setKelasList(res.data.data || res.data) 
    } catch (error) {
      toast.error('Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelasData()
  }, [])

  // Classroom Naming Logic: RA + Sem 6 -> R6A
  const formatClassName = (name, semester) => {
    if (!name) return '-'
    if (name.toUpperCase().startsWith('R') && name.length >= 2) {
      return `R${semester}${name.substring(1)}`
    }
    return name
  }

  // Client-side Filtering & Pagination
  const filteredKelas = useMemo(() => {
    return kelasList.filter(kelas => 
      kelas.nama_kelas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kelas.mata_kuliah?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kelas.dosen?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kelas.prodi?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
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

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-colors"
            placeholder="Cari kelas, matkul, atau dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {filteredKelas.length} kelas
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
                  {paginatedKelas.length === 0 ? (
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
                            {kelas.prodi && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">Prodi: {kelas.prodi.nama}</span>
                            )}
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
                          {kelas.dosenPA?.user?.name || '-'}
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
                          {/* Note: Edit feature will require its own separate logic/modal since it is complex */}
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
            {filteredKelas.length > 0 && (
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
