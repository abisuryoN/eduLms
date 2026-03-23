import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'

const Chat = () => {
  const { user } = useAuth()
  const [kelasList, setKelasList] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const rolePath = user?.role === 'admin' ? '/admin' : `/${user?.role}`

  // Classroom Naming Logic: RA + Sem 6 -> R6A
  const formatClassName = (name, semester) => {
    if (!name) return '-'
    if (name.toUpperCase().startsWith('R') && name.length >= 2) {
      return `R${semester}${name.substring(1)}`
    }
    return name
  }
  
  const messagesEndRef = useRef(null)

  // Fetch classes
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await api.get(`${rolePath}/kelas`)
        setKelasList(res.data)
        if (res.data.length > 0) {
          setSelectedKelasId(res.data[0].id)
        }
      } catch (error) {
         toast.error('Gagal mengambil daftar kelas')
      } finally {
        setLoading(false)
      }
    }
    fetchKelas()
  }, [])

  // Poll messages every 5 seconds for selected class
  useEffect(() => {
    if (!selectedKelasId) return
    
    const fetchMessages = async () => {
      try {
        const res = await api.get(`${rolePath}/kelas/${selectedKelasId}/chat`)
        // The API returns paginated data inside res.data.data
        setMessages(res.data.data.reverse()) // we reverse so it goes top-to-bottom
      } catch (error) {
        console.error('Fetch chat error', error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)

    return () => clearInterval(interval)
  }, [selectedKelasId])

  // Auto scroll to bottom when messages get added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedKelasId) return

    setSending(true)
    const backupMessage = newMessage
    setNewMessage('')
    
    try {
      const res = await api.post(`${rolePath}/kelas/${selectedKelasId}/chat`, {
        pesan: backupMessage
      })
      // append immediately locally to feel fast
      setMessages(prev => [...prev, res.data])
    } catch (error) {
      toast.error('Gagal memproses pesan')
      setNewMessage(backupMessage)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  if (loading) {
     return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar Channel List */}
      <Card className="w-full md:w-80 flex-shrink-0 flex flex-col h-1/3 md:h-full overflow-hidden border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
            <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Diskusi Kelas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1">
          {kelasList.length === 0 ? (
             <div className="p-6 text-center text-sm text-gray-500">Anda tidak terdaftar di kelas manapun.</div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {kelasList.map(k => (
                <li key={k.id}>
                  <button
                    onClick={() => setSelectedKelasId(k.id)}
                    className={`w-full text-left px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${
                      selectedKelasId === k.id ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500 font-medium' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div>
                      <div className={`text-sm ${selectedKelasId === k.id ? 'text-brand-900 dark:text-brand-400 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                        {k.mata_kuliah?.nama}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Kelas: {formatClassName(k.nama_kelas, k.semester)}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col h-2/3 md:h-full overflow-hidden border-2 border-brand-100 dark:border-brand-900/50 bg-white dark:bg-gray-900">
        {!selectedKelasId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50 text-brand-200" />
            <p>Pilih kelas di sebelah kiri untuk mulai berdiskusi</p>
          </div>
        ) : (
          <>
            {/* Header Diskusi */}
            <div className="px-6 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex shrink-0 items-center drop-shadow-sm z-10 transition-colors">
               <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    {kelasList.find(k => k.id === selectedKelasId)?.mata_kuliah?.nama || 'Diskusi Kelas'}
                  </h3>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium tracking-wide uppercase">
                    Pusat Diskusi Terbuka — {formatClassName(kelasList.find(k => k.id === selectedKelasId)?.nama_kelas, kelasList.find(k => k.id === selectedKelasId)?.semester)}
                  </p>
               </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-gray-950 space-y-4 relative transition-colors">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Kirim pesan pertama untuk memulai diskusi kelas ini.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isSentByMe = msg.user_id === user.id
                  const isDosen = msg.user?.role === 'dosen'

                  return (
                    <div key={msg.id || idx} className={`flex max-w-[80%] ${isSentByMe ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                       <div className={`flex flex-col gap-1 ${isSentByMe ? 'items-end' : 'items-start'}`}>
                          {!isSentByMe && (
                             <div className="flex items-center gap-1.5 px-1">
                                <span className={`text-xs font-semibold ${isDosen ? 'text-amber-600' : 'text-gray-600'}`}>
                                  {msg.user?.name}
                                </span>
                                {isDosen && (
                                   <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">
                                     Dosen
                                   </span>
                                )}
                             </div>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl relative shadow-sm text-sm ${
                            isSentByMe 
                              ? 'bg-brand-600 text-white rounded-br-sm' 
                              : isDosen 
                                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.pesan}</p>
                            <span className={`text-[10px] absolute -bottom-4 right-1 ${isSentByMe ? 'text-gray-400' : 'text-gray-400'}`}>
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div className="h-3"></div> {/* spacer for time */}
                       </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 shrink-0 transition-colors">
               <div className="relative flex items-center">
                 <textarea
                   rows={1}
                   value={newMessage}
                   onChange={e => setNewMessage(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault()
                       handleSendMessage(e)
                     }
                   }}
                   placeholder="Ketik lalu Enter untuk mengirim pesan diskusi..."
                   className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full pl-5 pr-14 py-3 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-brand-500 dark:text-gray-100 resize-none transition-colors"
                   style={{ minHeight: '46px', maxHeight: '120px' }}
                 />
                 <button
                   type="submit"
                   disabled={sending || !newMessage.trim()}
                   className="absolute right-2 shrink-0 bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   {sending ? (
                     <div className="w-4 h-4 rounded-full border-2 border-white border-b-transparent animate-spin" />
                   ) : (
                     <Send className="w-4 h-4 ml-0.5" />
                   )}
                 </button>
               </div>
               <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2 px-4 whitespace-nowrap overflow-hidden text-ellipsis">
                  Pesan Anda akan terlihat oleh seluruh dosen dan mahasiswa dalam kelas ini. Berkomunikasilah secara profesional.
               </div>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}

export default Chat
