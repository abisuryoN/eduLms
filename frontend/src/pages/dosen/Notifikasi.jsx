import { useState, useEffect } from 'react'
import { Send, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const Notifikasi = () => {
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    kelas_id: '',
    judul: '',
    pesan: ''
  })

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await api.get('/dosen/kelas')
        setKelasList(res.data)
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, kelas_id: res.data[0].id }))
        }
      } catch (error) {
        toast.error('Gagal memuat daftar kelas')
      } finally {
        setLoading(false)
      }
    }
    fetchKelas()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.kelas_id || !formData.judul || !formData.pesan) {
      toast.error('Harap lengkapi semua field')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/dosen/kelas/${formData.kelas_id}/notifikasi`, {
        judul: formData.judul,
        pesan: formData.pesan
      })
      toast.success('Pengumuman berhasil dikirim ke seluruh mahasiswa di kelas')
      setFormData(prev => ({ ...prev, judul: '', pesan: '' }))
    } catch (error) {
      toast.error('Gagal mengirim pengumuman')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Pengumuman Kelas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kirim notifikasi informasi atau pengumuman penting ke seluruh mahasiswa dalam kelas.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-brand-50 border-brand-100 flex flex-row items-center gap-3">
          <Users className="w-5 h-5 text-brand-600" />
          <CardTitle className="text-brand-900">Broadcast Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
             <div className="animate-pulse space-y-4">
               <div className="h-10 bg-gray-200 rounded w-full"></div>
               <div className="h-10 bg-gray-200 rounded w-full"></div>
               <div className="h-32 bg-gray-200 rounded w-full"></div>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                  Pilih Kelas Tujuan
                </label>
                <select
                  className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 transition-colors"
                  value={formData.kelas_id}
                  onChange={(e) => setFormData({...formData, kelas_id: e.target.value})}
                  required
                >
                  {kelasList.length === 0 && <option value="" disabled>Belum ada kelas</option>}
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.mata_kuliah?.nama} - {k.nama_kelas} ({k.mahasiswa_count||0} Mahasiswa)
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Judul Pengumuman"
                type="text"
                placeholder="Misal: Perubahan Jadwal Kuliah Pengganti"
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                required
              />

              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                  Isi Pengumuman
                </label>
                <textarea
                  rows={6}
                  className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 transition-colors resize-none"
                  placeholder="Tuliskan pesan lengkap disini..."
                  value={formData.pesan}
                  onChange={(e) => setFormData({...formData, pesan: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2" 
                  isLoading={submitting}
                  disabled={kelasList.length === 0}
                >
                  <Send className="w-4 h-4" />
                  Kirim Pengumuman Sekarang
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p>Pengumuman akan langsung muncul di panel notifikasi mahasiswa (ikon bel pojok kanan atas) secara seketika (real-time/polling).</p>
      </div>
    </div>
  )
}

export default Notifikasi
