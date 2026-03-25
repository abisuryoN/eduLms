import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, Play, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const Quiz = () => {
  const [kelasList, setKelasList] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [quizList, setQuizList] = useState([])
  const [loading, setLoading] = useState(true)

  // Quiz Taking State
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [soalList, setSoalList] = useState([])
  const [answers, setAnswers] = useState({}) // { soalId: jawaban }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Fetch registered classes first
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await api.get('/mahasiswa/kelas')
        setKelasList(res.data.data || res.data)
        const list = res.data.data || res.data
        if (list.length > 0) {
          setSelectedKelasId(list[0].id)
        }
      } catch (error) {
        console.error('Gagal memuat kelas', error)
      } finally {
        setLoading(false)
      }
    }
    fetchKelas()
  }, [])

  // Fetch quizzes when class changes
  useEffect(() => {
    if (!selectedKelasId || activeQuiz) return

    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/mahasiswa/kelas/${selectedKelasId}/quiz`)
        setQuizList(res.data.data || res.data)
      } catch (error) {
        toast.error('Gagal memuat daftar tugas/quiz')
      }
    }
    fetchQuiz()
  }, [selectedKelasId, activeQuiz])

  // Timer Effect
  useEffect(() => {
    if (activeQuiz && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (activeQuiz && timeLeft === 0 && !isSubmitting) {
      // Auto submit when time applies
      handleSubmitQuiz()
    }
  }, [activeQuiz, timeLeft, isSubmitting])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStartQuiz = async (quizId) => {
    try {
      const res = await api.get(`/mahasiswa/kelas/${selectedKelasId}/quiz/${quizId}`)
      const data = res.data.data || res.data
      setActiveQuiz(data)
      setSoalList(data.soal)
      setAnswers({})
      setTimeLeft(data.durasi_menit * 60)
    } catch (error) {
       toast.error('Gagal memuat soal quiz. Cobalah beberapa saat lagi.')
    }
  }

  const handleAnswerChange = (soalId, option) => {
    setAnswers(prev => ({
      ...prev,
      [soalId]: option
    }))
  }

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    // Format payload
    const payload = {
      jawaban: Object.keys(answers).map(soalId => ({
        soal_id: parseInt(soalId),
        jawaban: answers[soalId]
      }))
    }

    // Default missing answers to null/empty if handled by backend, but backend requires valid a,b,c,d
    // To prevent validation fail, we should filter out unassigned OR assign 'x' (handled gracefully backend)
    // Actually backend requires exactly one of the options. We'll only send answered ones. 
    // If requirement says all must be answered, we should check:
    if (payload.jawaban.length < soalList.length && timeLeft > 0) {
      if (!window.confirm('Ada soal yang belum dijawab. Yakin ingin mengumpulkan? Jawaban kosong akan mendapat poin 0.')) {
        setIsSubmitting(false)
        return
      }
    }

    try {
      const res = await api.post(`/mahasiswa/kelas/${selectedKelasId}/quiz/${activeQuiz.id}/submit`, payload)
      toast.success(res.data.message || 'Quiz berhasil dikumpulkan. Skor: ' + res.data.skor)
      setActiveQuiz(null)
      // Refresh list
      const quizRes = await api.get(`/mahasiswa/kelas/${selectedKelasId}/quiz`)
      setQuizList(quizRes.data.data || quizRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengumpulkan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
  }

  // QUIZ TAKING VIEW
  if (activeQuiz) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-20 z-10 bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">{activeQuiz.judul}</h2>
            <div className="text-sm text-gray-500">{soalList.length} Soal Pilihan Ganda</div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-brand-50 text-brand-700'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <Button onClick={handleSubmitQuiz} isLoading={isSubmitting}>Selesai & Kumpul</Button>
          </div>
        </div>

        {/* Soal List */}
        <div className="space-y-6 pb-20">
          {soalList.map((soal, idx) => (
            <Card key={soal.id} id={`soal-${soal.id}`} className={answers[soal.id] ? 'border-brand-300' : ''}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-6 whitespace-pre-line text-lg">{soal.pertanyaan}</p>
                    
                    <div className="space-y-3">
                      {['a', 'b', 'c', 'd'].map(opt => (
                        <label 
                          key={opt}
                          className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                            answers[soal.id] === opt 
                              ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' 
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name={`soal-${soal.id}`} 
                            value={opt} 
                            className="mt-1 flex-shrink-0"
                            checked={answers[soal.id] === opt}
                            onChange={() => handleAnswerChange(soal.id, opt)}
                          />
                          <span className="text-gray-700">
                             <span className="font-bold mr-2 uppercase">{opt}.</span>
                             {soal[`opsi_${opt}`]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating Navigator */}
        <div className="fixed bottom-6 right-6 lg:right-12 bg-white p-4 rounded-2xl shadow-xl ring-1 ring-black/5 flex gap-2 flex-wrap max-w-xs">
           {soalList.map((soal, idx) => (
              <button
                key={soal.id}
                onClick={() => document.getElementById(`soal-${soal.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  answers[soal.id] 
                    ? 'bg-brand-500 text-white hover:bg-brand-600' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {idx + 1}
              </button>
           ))}
        </div>
      </div>
    )
  }

  // REGULAR LIST VIEW
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tugas & Quiz</h1>
        <p className="mt-1 text-sm text-gray-500">
          Evaluasi pembelajaran dan tugas online terintegrasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-sm">Filter Kelas</CardTitle>
            </CardHeader>
            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
              {kelasList.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">Belum ada kelas</div>
              ) : (
                kelasList.map(k => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKelasId(k.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs lg:text-sm ${
                      selectedKelasId === k.id 
                        ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200 font-semibold' 
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="truncate">{k.mata_kuliah?.nama}</div>
                    <div className={`text-[10px] lg:text-xs mt-0.5 ${selectedKelasId === k.id ? 'text-brand-500' : 'text-gray-400'}`}>
                      Kls: {k.nama_kelas}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          {quizList.length === 0 ? (
            <Card className="p-12 text-center text-gray-500 border-dashed">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Tidak ada tugas atau quiz aktif untuk kelas ini.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {quizList.map(quiz => (
                <Card key={quiz.id} className="relative overflow-hidden group border-transparent hover:border-gray-200 transition-colors">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${quiz.sudah_dikerjakan ? 'bg-gray-300' : 'bg-brand-500'}`}></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                            Pertemuan {quiz.pertemuan}
                          </span>
                          {quiz.sudah_dikerjakan && (
                             <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                               <CheckCircle className="w-3.5 h-3.5" /> Selesai Dikerjakan
                             </span>
                          )}
                        </div>
                        <h3 className={`text-lg font-bold ${quiz.sudah_dikerjakan ? 'text-gray-500' : 'text-gray-900'}`}>{quiz.judul}</h3>
                        {quiz.deskripsi && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{quiz.deskripsi}</p>}
                        
                        <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {quiz.durasi_menit} Menit</span>
                          <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-current"/> Pilihan Ganda ({quiz.soal_count} Soal)</span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto">
                        {quiz.sudah_dikerjakan ? (
                           <Button variant="secondary" className="w-full sm:w-auto pointer-events-none opacity-50" disabled>
                              Sudah Mengerjakan
                           </Button>
                        ) : (
                           <Button 
                             className="w-full sm:w-auto" 
                             onClick={() => handleStartQuiz(quiz.id)}
                           >
                             <Play className="w-4 h-4 mr-2" fill="currentColor" /> Mulai Kerjakan
                           </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz
