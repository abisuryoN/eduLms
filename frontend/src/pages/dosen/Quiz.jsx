import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Edit2, ArrowLeft, Clock, Save, FileQuestion } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const Quiz = () => {
  const { kelasId } = useParams()
  const [quizList, setQuizList] = useState([])
  const [kelasDetail, setKelasDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mode: list, create
  const [viewMode, setViewMode] = useState('list')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quiz Form Data
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    durasi_menit: '60',
    pertemuan: '1',
    is_active: true,
  })

  // Soal Array
  const [soalList, setSoalList] = useState([
    { pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', jawaban_benar: 'a', poin: '10' }
  ])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [resQuiz, resKelas] = await Promise.all([
          api.get(`/dosen/kelas/${kelasId}/quiz`),
          api.get('/dosen/kelas')
        ])
        const resQuizData = resQuiz.data.data || resQuiz.data
        const resKelasData = resKelas.data.data || resKelas.data
        setQuizList(resQuizData)
        setKelasDetail(resKelasData.find(k => k.id === parseInt(kelasId)))
      } catch (error) {
        toast.error('Gagal memuat data quiz')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [kelasId])

  const addSoal = () => {
    setSoalList([...soalList, { pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', jawaban_benar: 'a', poin: '10' }])
  }

  const removeSoal = (index) => {
    if (soalList.length === 1) return toast.error('Minimal harus ada 1 soal')
    const newList = [...soalList]
    newList.splice(index, 1)
    setSoalList(newList)
  }

  const handleSoalChange = (index, field, value) => {
    const newList = [...soalList]
    newList[index][field] = value
    setSoalList(newList)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post(`/dosen/kelas/${kelasId}/quiz`, {
        ...formData,
        soal: soalList
      })
      toast.success('Quiz berhasil dibuat')
      setViewMode('list')
      // Refresh list
      const res = await api.get(`/dosen/kelas/${kelasId}/quiz`)
      setQuizList(res.data.data || res.data)
      // reset form
      setFormData({ judul: '', deskripsi: '', durasi_menit: '60', pertemuan: '1', is_active: true })
      setSoalList([{ pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', jawaban_benar: 'a', poin: '10' }])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleStatus = async (quiz) => {
    try {
      await api.put(`/dosen/kelas/${kelasId}/quiz/${quiz.id}`, {
        is_active: !quiz.is_active
      })
      const res = await api.get(`/dosen/kelas/${kelasId}/quiz`)
      setQuizList(res.data.data || res.data)
      toast.success(`Status quiz diperbarui`)
    } catch (error) {
       toast.error('Gagal update status')
    }
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setViewMode('list')} className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Quiz Baru</h1>
            <p className="mt-1 text-sm text-gray-500">Isi pengaturan quiz dan tambahkan soal-soal pilihan ganda.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Pengaturan Dasar</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Judul Quiz"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Deskripsi / Aturan (Opsional)"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                />
              </div>
              <Input
                label="Durasi (Menit)"
                type="number"
                min="1"
                value={formData.durasi_menit}
                onChange={(e) => setFormData({...formData, durasi_menit: e.target.value})}
                required
              />
              <Input
                label="Pertemuan Ke-"
                type="number"
                min="1"
                max="16"
                value={formData.pertemuan}
                onChange={(e) => setFormData({...formData, pertemuan: e.target.value})}
                required
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Daftar Soal</h2>
            {soalList.map((soal, index) => (
              <Card key={index} className="border-l-4 border-l-brand-500">
                <CardHeader className="flex flex-row justify-between items-center py-3 bg-gray-50 relative border-b">
                  <div className="font-semibold text-gray-700">Soal #{index + 1}</div>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeSoal(index)}>Hapus</Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <Input
                    label="Pertanyaan"
                    value={soal.pertanyaan}
                    onChange={(e) => handleSoalChange(index, 'pertanyaan', e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Opsi A" value={soal.opsi_a} onChange={(e) => handleSoalChange(index, 'opsi_a', e.target.value)} required />
                    <Input label="Opsi B" value={soal.opsi_b} onChange={(e) => handleSoalChange(index, 'opsi_b', e.target.value)} required />
                    <Input label="Opsi C" value={soal.opsi_c} onChange={(e) => handleSoalChange(index, 'opsi_c', e.target.value)} required />
                    <Input label="Opsi D" value={soal.opsi_d} onChange={(e) => handleSoalChange(index, 'opsi_d', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Kunci Jawaban Benar</label>
                      <select
                        className="block w-full rounded-xl border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                        value={soal.jawaban_benar}
                        onChange={(e) => handleSoalChange(index, 'jawaban_benar', e.target.value)}
                      >
                        <option value="a">A</option><option value="b">B</option>
                        <option value="c">C</option><option value="d">D</option>
                      </select>
                    </div>
                    <Input
                      label="Poin"
                      type="number"
                      min="1"
                      value={soal.poin}
                      onChange={(e) => handleSoalChange(index, 'poin', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button type="button" variant="secondary" className="w-full py-3" onClick={addSoal}>
              <Plus className="w-4 h-4 mr-2" /> Tambah Soal
            </Button>
          </div>

          <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg ring-1 ring-gray-900/5 flex justify-end gap-3 z-10">
            <Button type="button" variant="secondary" onClick={() => setViewMode('list')}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting} className="min-w-40">
              <Save className="w-4 h-4 mr-2" />
              Simpan Quiz
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dosen/dashboard">
            <Button variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz & Ujian</h1>
            <p className="mt-1 text-sm text-gray-500">
              {kelasDetail ? `${kelasDetail.mata_kuliah?.nama} - ${kelasDetail.nama_kelas}` : 'Memuat data...'}
            </p>
          </div>
        </div>
        <Button onClick={() => setViewMode('create')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Quiz
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Judul Quiz</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Durasi (Menit)</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Pertemuan</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Jml Soal</th>
                <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-gray-500">Memuat data...</td>
                </tr>
              ) : quizList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-gray-500">Belum ada quiz yang dibuat.</td>
                </tr>
              ) : (
                quizList.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <FileQuestion className="w-5 h-5 text-brand-500 flex-shrink-0" />
                        <div>
                          <p>{quiz.judul}</p>
                          {quiz.deskripsi && <p className="text-xs text-gray-400 font-normal truncate max-w-xs">{quiz.deskripsi}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-1"><Clock className="w-4 h-4"/> {quiz.durasi_menit}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                      Ke-{quiz.pertemuan}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                      {quiz.soal_count}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium">
                      <button
                        onClick={() => toggleStatus(quiz)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          quiz.is_active 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {quiz.is_active ? 'Aktif' : 'Draft / Nonaktif'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Quiz
