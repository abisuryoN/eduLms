import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'

const ManajemenMataKuliah = () => {
    const [matkulList, setMatkulList] = useState([])
    const [fakultasList, setFakultasList] = useState([])
    const [prodiList, setProdiList] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add') // add or edit
    const [selectedMatkul, setSelectedMatkul] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Search & Pagination State
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Form State
    const [formData, setFormData] = useState({
        fakultas_id: '',
        prodi_id: '',
        kode: '',
        nama: '',
        sks: '',
        semester: ''
    })

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [resMatkul, resFakultas, resProdi] = await Promise.all([
                api.get('/admin/mata-kuliah'),
                api.get('/admin/fakultas'),
                api.get('/admin/prodi')
            ])
            setMatkulList(resMatkul.data?.data || resMatkul.data || [])
            setFakultasList(resFakultas.data?.data || resFakultas.data || [])
            setProdiList(resProdi.data?.data || resProdi.data || [])
        } catch (error) {
            toast.error('Gagal memuat data master')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    // Dependent Dropdown Logic (Filter prodi by selected fakultas)
    const filteredProdi = useMemo(() => {
        if (!formData.fakultas_id) return []
        return prodiList.filter(p => p.fakultas_id.toString() === formData.fakultas_id.toString())
    }, [formData.fakultas_id, prodiList])

    useEffect(() => {
        if (formData.fakultas_id) {
            // Reset prodi_id if the newly filtered list doesn't contain current prodi_id
            if (!filteredProdi.find(p => p.id.toString() === formData.prodi_id.toString())) {
                setFormData(prev => ({ ...prev, prodi_id: '' }))
            }
        } else {
            setFormData(prev => ({ ...prev, prodi_id: '' }))
        }
    }, [formData.fakultas_id, filteredProdi])

    // Client-side Filtering & Pagination
    const filteredMatkul = useMemo(() => {
        return matkulList.filter(mk => 
            mk.kode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mk.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mk.prodi?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [matkulList, searchQuery])

    const paginatedMatkul = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredMatkul.slice(startIndex, startIndex + pageSize)
    }, [filteredMatkul, currentPage, pageSize])

    const totalPages = Math.ceil(filteredMatkul.length / pageSize)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, pageSize])

    const handleOpenModal = (mode, matkul = null) => {
        setModalMode(mode)
        if (mode === 'edit' && matkul) {
            setSelectedMatkul(matkul)
            setFormData({
                fakultas_id: matkul.prodi?.fakultas_id || '',
                prodi_id: matkul.prodi_id || '',
                kode: matkul.kode || '',
                nama: matkul.nama || '',
                sks: matkul.sks || '',
                semester: matkul.semester || '',
            })
        } else {
            setSelectedMatkul(null)
            setFormData({
                fakultas_id: '',
                prodi_id: '',
                kode: '',
                nama: '',
                sks: '',
                semester: '',
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.prodi_id) {
            toast.error('Silakan pilih Program Studi terlebih dahulu')
            return
        }
        setIsSubmitting(true)

        const payload = {
            prodi_id: formData.prodi_id,
            kode: formData.kode,
            nama: formData.nama,
            sks: parseInt(formData.sks),
            semester: parseInt(formData.semester)
        }

        try {
            if (modalMode === 'add') {
                await api.post('/admin/mata-kuliah', payload)
                toast.success('Mata Kuliah berhasil dibuat')
            } else {
                await api.put(`/admin/mata-kuliah/${selectedMatkul.id}`, payload)
                toast.success('Mata Kuliah berhasil diupdate')
            }
            setIsModalOpen(false)
            fetchAllData()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan Mata Kuliah')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus mata kuliah ini? Data yang terkait juga berpotensi terhapus.')) {
            try {
                await api.delete(`/admin/mata-kuliah/${id}`)
                toast.success('Mata Kuliah berhasil dihapus')
                fetchAllData()
            } catch (error) {
                toast.error('Gagal menghapus Mata Kuliah')
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data mata kuliah serta relasinya dengan Program Studi.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Button onClick={() => handleOpenModal('add')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Mata Kuliah
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
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-colors"
                        placeholder="Cari kode, nama matkul, prodi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan {filteredMatkul.length} mata kuliah
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Kode & Nama</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">SKS & Semester</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Prodi</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Fakultas</th>
                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Memuat data...</td>
                                </tr>
                            ) : paginatedMatkul.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada mata kuliah yang dibuat.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedMatkul.map((mk) => (
                                    <tr key={mk.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                                            <div className="flex flex-col">
                                                <span>{mk.nama}</span>
                                                <span className="text-[11px] text-gray-500 font-normal">{mk.kode}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {mk.sks} SKS • Sem {mk.semester}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {mk.prodi?.nama || '-'} ({mk.prodi?.jenjang})
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {mk.prodi?.fakultas?.nama || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => handleOpenModal('edit', mk)}>
                                                <Edit2 className="w-4 h-4 text-brand-600" />
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(mk.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredMatkul.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={filteredMatkul.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </Card>

            {/* Form Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Tambah Mata Kuliah' : 'Edit Mata Kuliah'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Dropdown Fakultas */}
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Fakultas</label>
                        <select
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
                            value={formData.fakultas_id}
                            onChange={(e) => setFormData({...formData, fakultas_id: e.target.value})}
                            required
                        >
                            <option value="" disabled>Pilih Fakultas...</option>
                            {fakultasList.map((fakultas) => (
                                <option key={fakultas.id} value={fakultas.id}>
                                    {fakultas.kode} - {fakultas.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dropdown Prodi */}
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Program Studi</label>
                        <select
                            className={`block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors ${!formData.fakultas_id ? 'opacity-50' : ''}`}
                            value={formData.prodi_id}
                            onChange={(e) => setFormData({...formData, prodi_id: e.target.value})}
                            required
                            disabled={!formData.fakultas_id}
                        >
                            <option value="" disabled>Pilih Program Studi...</option>
                            {filteredProdi.map((prodi) => (
                                <option key={prodi.id} value={prodi.id}>
                                    {prodi.kode} - {prodi.nama} ({prodi.jenjang})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Kode Mata Kuliah"
                            type="text"
                            value={formData.kode}
                            onChange={(e) => setFormData({...formData, kode: e.target.value})}
                            placeholder="MK-101"
                            required
                        />
                        <Input
                            label="SKS"
                            type="number"
                            min="1"
                            value={formData.sks}
                            onChange={(e) => setFormData({...formData, sks: e.target.value})}
                            required
                        />
                    </div>

                    <Input
                        label="Nama Mata Kuliah"
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        placeholder="Pemrograman Terstruktur"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Semester</label>
                        <select
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
                            value={formData.semester}
                            onChange={(e) => setFormData({...formData, semester: e.target.value})}
                            required
                        >
                            <option value="" disabled>Pilih Semester...</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
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

export default ManajemenMataKuliah
