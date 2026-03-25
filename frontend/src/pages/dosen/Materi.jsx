import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileText, Link as LinkIcon, Video, Download, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

const Materi = () => {
  const { kelasId } = useParams()
  const [kelasDetail, setKelasDetail] = useState(null)
  const [materiList, setMateriList] = useState([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedMateri, setSelectedMateri] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    pertemuan: '1',
    judul: '',
    deskripsi: '',
    tipe: 'file',
    url: '',
    file: null
  })

  // We should fetch kelas detail just to get the name
  const fetchKelasDetail = async () => {
    try {
      const res = await api.get('/dosen/kelas')
      const list = res.data.data || res.data
      const target = list.find(k => k.id === parseInt(kelasId))
      setKelasDetail(target)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMateri = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/dosen/kelas/${kelasId}/materi`)
      setMateriList(res.data.data || res.data)
    } catch (error) {
      toast.error('Gagal memuat daftar materi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelasDetail()
    fetchMateri()
  }, [kelasId])

  const handleOpenModal = (mode, materi = null) => {
    setModalMode(mode)
    if (mode === 'edit' && materi) {
      setSelectedMateri(materi)
      setFormData({
        pertemuan: materi.pertemuan,
        judul: materi.judul,
        deskripsi: materi.deskripsi || '',
        tipe: materi.tipe,
        url: materi.url || '',
        file: null
      })
    } else {
      setSelectedMateri(null)
      setFormData({
        pertemuan: '1',
        judul: '',
        deskripsi: '',
        tipe: 'file',
        url: '',
        file: null
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const payload = new FormData()
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        payload.append(key, formData[key])
      }
    })

    if (modalMode === 'edit') {
      payload.append('_method', 'PUT') // For Laravel file upload on update
    }

    try {
      if (modalMode === 'add') {
        await api.post(`/dosen/kelas/${kelasId}/materi`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Materi berhasil ditambahkan')
      } else {
        await api.post(`/dosen/kelas/${kelasId}/materi/${selectedMateri.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Materi berhasil diupdate')
      }
      setIsModalOpen(false)
      fetchMateri()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan materi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus materi ini?')) {
      try {
        await api.delete(`/dosen/kelas/${kelasId}/materi/${id}`)
        toast.success('Materi berhasil dihapus')
        fetchMateri()
      } catch (error) {
        toast.error('Gagal menghapus materi')
      }
    }
  }

  const getIcon = (tipe) => {
    switch(tipe) {
      case 'file': return <FileText className="w-5 h-5 text-blue-500" />
      case 'video': return <Video className="w-5 h-5 text-rose-500" />
      case 'link': return <LinkIcon className="w-5 h-5 text-emerald-500" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dosen/dashboard">
            <Button variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Materi Kelas</h1>
            <p className="mt-1 text-sm text-gray-500">
              {kelasDetail ? `${kelasDetail.mata_kuliah?.nama} - ${kelasDetail.nama_kelas}` : 'Memuat data kelas...'}
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal('add')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Materi
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
      ) : materiList.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 border-dashed">
          Materi belum tersedia untuk kelas ini. Klik tombol "Tambah Materi" untuk memulai.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiList.map(materi => (
            <Card key={materi.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between pb-2 border-b-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getIcon(materi.tipe)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                      Pertemuan {materi.pertemuan}
                    </span>
                    <CardTitle className="text-base line-clamp-1 mt-0.5">{materi.judul}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-2">
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                  {materi.deskripsi || 'Tidak ada deskripsi'}
                </p>
                
                <div className="mt-auto space-y-3">
                  {materi.tipe === 'file' ? (
                    <a 
                      href={`${api.defaults.baseURL.replace('/api', '')}/storage/${materi.file_path}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium bg-brand-50 p-2 rounded-lg justify-center transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </a>
                  ) : (
                    <a 
                      href={materi.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium bg-brand-50 p-2 rounded-lg justify-center transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Buka Tautan
                    </a>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleOpenModal('edit', materi)}>
                      <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(materi.id)}>
                      <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Materi Baru' : 'Edit Materi'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pertemuan Ke-"
            type="number"
            min="1"
            max="16"
            value={formData.pertemuan}
            onChange={(e) => setFormData({...formData, pertemuan: e.target.value})}
            required
          />

          <Input
            label="Judul Materi"
            type="text"
            value={formData.judul}
            onChange={(e) => setFormData({...formData, judul: e.target.value})}
            required
          />

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Deskripsi Ringkas</label>
            <textarea
              className="block w-full rounded-xl border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
              rows={3}
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Tipe Materi</label>
            <select
              className="block w-full rounded-xl border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
              value={formData.tipe}
              onChange={(e) => setFormData({...formData, tipe: e.target.value})}
            >
              <option value="file">Dokumen / File (PDF, PPT, DOC)</option>
              <option value="link">Tautan Web Terluar</option>
              <option value="video">Tautan Video (YouTube, dll)</option>
            </select>
          </div>

          {formData.tipe === 'file' ? (
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Upload File {modalMode === 'edit' && '(Opsional, biarkan kosong jika tak diubah)'}</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                required={modalMode === 'add'}
              />
            </div>
          ) : (
            <Input
              label="URL / Tautan"
              type="url"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              required
            />
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Materi</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Materi
