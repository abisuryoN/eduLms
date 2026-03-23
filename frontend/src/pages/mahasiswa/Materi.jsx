import { useState, useEffect } from 'react'
import { BookOpen, FileText, Link as LinkIcon, Video, Download } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const Materi = () => {
  const [kelasList, setKelasList] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [materiList, setMateriList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMateri, setLoadingMateri] = useState(false)

  // Fetch registered classes first
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await api.get('/mahasiswa/kelas')
        setKelasList(res.data)
        if (res.data.length > 0) {
          setSelectedKelasId(res.data[0].id)
        }
      } catch (error) {
        console.error('Gagal memuat kelas', error)
      } finally {
        setLoading(false)
      }
    }
    fetchKelas()
  }, [])

  // Fetch materi when class changes
  useEffect(() => {
    if (!selectedKelasId) return

    const fetchMateri = async () => {
      setLoadingMateri(true)
      try {
        const res = await api.get(`/mahasiswa/kelas/${selectedKelasId}/materi`)
        setMateriList(res.data)
      } catch (error) {
        console.error('Gagal memuat materi', error)
      } finally {
        setLoadingMateri(false)
      }
    }
    fetchMateri()
  }, [selectedKelasId])

  const getIcon = (tipe) => {
    switch(tipe) {
      case 'file': return <FileText className="w-6 h-6 text-blue-500" />
      case 'video': return <Video className="w-6 h-6 text-rose-500" />
      case 'link': return <LinkIcon className="w-6 h-6 text-emerald-500" />
      default: return <FileText className="w-6 h-6" />
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Materi Kuliah</h1>
        <p className="mt-1 text-sm text-gray-500">
          Akses seluruh materi perkuliahan berdasarkan kelas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Class Selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-sm">Pilih Kelas</CardTitle>
            </CardHeader>
            <div className="p-2 space-y-1">
              {kelasList.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">Anda belum terdaftar di kelas manapun.</div>
              ) : (
                kelasList.map(k => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKelasId(k.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${
                      selectedKelasId === k.id 
                        ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm border font-semibold' 
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="truncate">{k.mata_kuliah?.nama}</div>
                    <div className={`text-xs mt-1 ${selectedKelasId === k.id ? 'text-brand-500' : 'text-gray-400'}`}>
                      Kelas {k.nama_kelas}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {loadingMateri ? (
             <div className="flex justify-center p-12 bg-white rounded-2xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
          ) : !selectedKelasId ? (
            <Card className="p-12 text-center text-gray-500 border-dashed">
              Pilih kelas di samping untuk melihat materi.
            </Card>
          ) : materiList.length === 0 ? (
            <Card className="p-12 text-center text-gray-500 border-dashed">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Belum ada materi yang diunggah oleh Dosen untuk kelas ini.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiList.map(materi => (
                <Card key={materi.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        {getIcon(materi.tipe)}
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold mb-1 border border-brand-200">
                          Pertemuan {materi.pertemuan}
                        </span>
                        <h3 className="font-bold text-gray-900 line-clamp-2">{materi.judul}</h3>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                      {materi.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                    
                    <div className="mt-auto">
                      {materi.tipe === 'file' ? (
                        <a 
                          href={`http://localhost:8000/storage/${materi.file_path}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Button className="w-full justify-center gap-2">
                            <Download className="w-4 h-4" /> Download File
                          </Button>
                        </a>
                      ) : (
                        <a 
                          href={materi.url} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                           <Button className="w-full justify-center gap-2" variant="secondary">
                            <LinkIcon className="w-4 h-4" /> Buka Tautan Terluar
                          </Button>
                        </a>
                      )}
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

export default Materi
