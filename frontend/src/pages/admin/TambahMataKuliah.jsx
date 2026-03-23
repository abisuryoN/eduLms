import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const TambahMataKuliah = () => {
    const navigate = useNavigate()
    const [fakultasList, setFakultasList] = useState([])
    const [prodiList, setProdiList] = useState([])
    const [filteredProdi, setFilteredProdi] = useState([])
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        fakultas_id: '',
        prodi_id: '',
        kode: '',
        nama: '',
        sks: '',
        semester: ''
    })

    useEffect(() => {
        const fetchMasterData = async () => {
             try {
                 const [resFakultas, resProdi] = await Promise.all([
                     api.get('/admin/fakultas'),
                     api.get('/admin/prodi')
                 ])
                 setFakultasList(resFakultas.data?.data || [])
                 setProdiList(resProdi.data?.data || [])
             } catch (error) {
                 toast.error('Gagal mengambil data master')
             }
        }
        fetchMasterData()
    }, [])

    useEffect(() => {
         if (formData.fakultas_id) {
             const filtered = prodiList.filter(
                 (p) => p.fakultas_id.toString() === formData.fakultas_id.toString()
             )
             setFilteredProdi(filtered)
             // Reset prodi_id if the selected prodi is not in the filtered list
             if (!filtered.find(p => p.id.toString() === formData.prodi_id.toString())) {
                 setFormData(prev => ({ ...prev, prodi_id: '' }))
             }
         } else {
             setFilteredProdi([])
             setFormData(prev => ({ ...prev, prodi_id: '' }))
         }
    }, [formData.fakultas_id, prodiList])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.prodi_id) {
            toast.error('Silakan pilih Program Studi terlebih dahulu.')
            return
        }

        setLoading(true)
        try {
             await api.post('/admin/mata-kuliah', {
                 prodi_id: formData.prodi_id,
                 kode: formData.kode,
                 nama: formData.nama,
                 sks: parseInt(formData.sks),
                 semester: parseInt(formData.semester)
             })
             toast.success('Mata Kuliah berhasil ditambahkan')
             // Redirect implementation depends on the specific routes mapping, we'll go back for now
             window.history.back()
        } catch (error) {
             const msg = error.response?.data?.message || 'Gagal menambahkan Mata Kuliah'
             toast.error(msg)
        } finally {
             setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic">Tambah Mata Kuliah</h1>
                    <p className="text-gray-500 dark:text-gray-400">Tambahkan mata kuliah baru dengan memilih Fakultas dan Program Studi (Filter dinamis).</p>
                </div>
            </div>

            <Card className="p-8 max-w-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-brand-500/5 rounded-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dropdown Fakultas */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Fakultas</label>
                        <select
                            name="fakultas_id"
                            value={formData.fakultas_id}
                            onChange={handleChange}
                            className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent p-3 outline-none text-sm transition-all"
                            required
                        >
                            <option value="">-- Pilih Fakultas --</option>
                            {fakultasList.map((fakultas) => (
                                <option key={fakultas.id} value={fakultas.id}>
                                    {fakultas.kode} - {fakultas.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dropdown Prodi */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Program Studi</label>
                        <select
                            name="prodi_id"
                            value={formData.prodi_id}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent p-3 outline-none text-sm transition-all ${!formData.fakultas_id ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                            required
                            disabled={!formData.fakultas_id}
                        >
                            <option value="">-- Pilih Program Studi --</option>
                            {filteredProdi.map((prodi) => (
                                <option key={prodi.id} value={prodi.id}>
                                    {prodi.kode} - {prodi.nama} ({prodi.jenjang})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Kode */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Kode Mata Kuliah</label>
                            <Input
                                name="kode"
                                value={formData.kode}
                                onChange={handleChange}
                                placeholder="CTH: MK-101"
                                required
                            />
                        </div>

                        {/* Input SKS */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">SKS</label>
                            <Input
                                type="number"
                                name="sks"
                                value={formData.sks}
                                onChange={handleChange}
                                placeholder="CTH: 3"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    {/* Input Nama */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nama Mata Kuliah</label>
                        <Input
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="CTH: Pemrograman Web Dasar"
                            required
                        />
                    </div>

                    {/* Input Semester */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Semester</label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent p-3 outline-none text-sm transition-all"
                            required
                        >
                            <option value="">-- Pilih Semester --</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>
                                    Semester {sem}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => window.history.back()}
                            className="px-6 rounded-2xl border-gray-200 dark:border-gray-700"
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-8 rounded-2xl shadow-lg shadow-brand-500/20"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default TambahMataKuliah
