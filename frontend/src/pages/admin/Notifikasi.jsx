import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Send, Bell } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

const Notifikasi = () => {
  const [judul, setJudul] = useState('')
  const [pesan, setPesan] = useState('')
  const [target, setTarget] = useState('Semua')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!judul || !pesan) {
      toast.error('Judul dan pesan wajib diisi')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/admin/notifikasi', {
        judul,
        pesan,
        target_role: target === 'Semua' ? 'all' : target.toLowerCase()
      })
      
      toast.success('Notifikasi berhasil dikirim')
      setJudul('')
      setPesan('')
      setTarget('Semua')
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Gagal mengirim notifikasi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kirim Notifikasi</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kirim pemberitahuan ke semua pengguna, Dosen, atau Mahasiswa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <CardTitle>Form Notifikasi Baru</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Judul Notifikasi"
              placeholder="Masukkan judul notifikasi"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Penerima
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border"
              >
                <option value="Semua">Semua Pengguna</option>
                <option value="Dosen">Dosen Saja</option>
                <option value="Mahasiswa">Mahasiswa Saja</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pesan Notifikasi
              </label>
              <textarea
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                rows={4}
                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border"
                placeholder="Tulis detail pemberitahuan di sini..."
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading} className="gap-2">
                <Send className="w-4 h-4" />
                Kirim Notifikasi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifikasi
