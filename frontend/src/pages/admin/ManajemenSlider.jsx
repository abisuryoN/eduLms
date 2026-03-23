import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, MoveUp, MoveDown } from 'lucide-react'
import api from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { toast } from 'react-hot-toast'

const ManajemenSlider = () => {
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSlide, setEditingSlide] = useState(null)
    
    const [formData, setFormData] = useState({
        text: '',
        author: '',
        sub: '',
        active: true,
        order: 0,
        image: null
    })

    const fetchSlides = async () => {
        try {
            const response = await api.get('/admin/login-slides')
            const data = response.data?.data ?? response.data
            setSlides(Array.isArray(data) ? data : [])
        } catch (error) {
            toast.error('Gagal mengambil data slide')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSlides()
    }, [])

    const handleOpenModal = (slide = null) => {
        if (slide) {
            setEditingSlide(slide)
            setFormData({
                text: slide.text,
                author: slide.author,
                sub: slide.sub || '',
                active: slide.active,
                order: slide.order,
                image: null // Don't reset image path here, we use it for preview
            })
        } else {
            setEditingSlide(null)
            setFormData({
                text: '',
                author: '',
                sub: '',
                active: true,
                order: slides.length + 1,
                image: null
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = new FormData()
        data.append('text', formData.text)
        data.append('author', formData.author)
        data.append('sub', formData.sub)
        data.append('active', formData.active ? 1 : 0)
        data.append('order', formData.order)
        if (formData.image) {
            data.append('image', formData.image)
        }

        try {
            if (editingSlide) {
                // Laravel workaround for PUT with files: use POST + _method=PUT
                data.append('_method', 'PUT')
                await api.post(`/admin/login-slides/${editingSlide.id}`, data)
                toast.success('Slide berhasil diperbarui')
            } else {
                await api.post('/admin/login-slides', data)
                toast.success('Slide baru berhasil ditambahkan')
            }
            setIsModalOpen(false)
            fetchSlides()
        } catch (error) {
            const msg = error.response?.data?.message || 'Gagal menyimpan slide. Pastikan ukuran gambar < 2MB.'
            toast.error(msg)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus slide ini?')) return
        try {
            await api.delete(`/admin/login-slides/${id}`)
            toast.success('Slide berhasil dihapus')
            fetchSlides()
        } catch (error) {
            toast.error('Gagal menghapus slide')
        }
    }

    const toggleActive = async (slide) => {
        try {
            const data = new FormData()
            data.append('_method', 'PUT')
            data.append('active', !slide.active ? 1 : 0)
            await api.post(`/admin/login-slides/${slide.id}`, data)
            toast.success(`Slide ${!slide.active ? 'diaktifkan' : 'dinonaktifkan'}`)
            fetchSlides()
        } catch (error) {
            toast.error('Gagal mengubah status slide')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic">Manajemen Slider Login</h1>
                    <p className="text-gray-500 dark:text-gray-400">Kelola kutipan dan gambar background yang muncul di halaman login.</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal()} 
                    className="bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Slide
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Preview</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Order</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Konten / Kutipan</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Penulis / Sub</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Memuat data...</td>
                                </tr>
                            ) : slides.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Belum ada data slide.</td>
                                </tr>
                            ) : (
                                slides.map((slide) => (
                                    <tr key={slide.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="h-12 w-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                {slide.image_url ? (
                                                    <img src={slide.image_url} alt="Slide" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-brand-600 dark:text-brand-400">{slide.order}</td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 italic">“{slide.text}”</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{slide.author}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{slide.sub}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => toggleActive(slide)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                    slide.active 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {slide.active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {slide.active ? 'Aktif' : 'Non-aktif'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(slide)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(slide.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Edit/Tambah */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 italic">
                                {editingSlide ? 'Edit Slide' : 'Tambah Slide Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Kutipan / Konten</label>
                                <textarea
                                    className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent p-4 min-h-[120px] outline-none text-sm transition-all"
                                    value={formData.text}
                                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                                    placeholder="Masukkan kutipan atau informasi..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Penulis</label>
                                    <Input
                                        value={formData.author}
                                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                                        placeholder="Nelson Mandela"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Sub Judul</label>
                                    <Input
                                        value={formData.sub}
                                        onChange={(e) => setFormData({...formData, sub: e.target.value})}
                                        placeholder="Freedom Fighter"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Background Image (Opsional)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-brand-400"
                                        />
                                    </div>
                                    {editingSlide?.image_url && !formData.image && (
                                        <div className="h-10 w-16 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <img src={editingSlide.image_url} alt="Current" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 ml-1">* Max size 2MB (JPG, PNG, WebP)</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Order (Urutan)</label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({...formData, order: e.target.value})}
                                        placeholder="1"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col justify-end pb-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative h-6 w-11">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={formData.active}
                                                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                            />
                                            <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-green-500 transition-all duration-300" />
                                            <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-all duration-300 peer-checked:left-6 shadow-md" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 rounded-2xl border-gray-200 dark:border-gray-700"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-brand-600 hover:bg-brand-700 text-white px-8 rounded-2xl shadow-lg shadow-brand-500/20"
                                >
                                    Simpan Slide
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManajemenSlider
