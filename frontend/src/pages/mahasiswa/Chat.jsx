import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Send, MessageSquare, MoreVertical, Edit2, Trash2, X, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const Chat = () => {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const initialKelasId = searchParams.get('kelas_id')

    const [kelasList, setKelasList] = useState([])
    const [selectedKelasId, setSelectedKelasId] = useState(initialKelasId || '')
    const [kelasInfo, setKelasInfo] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    
    // Edit & Reply logic
    const [editingMessage, setEditingMessage] = useState(null)

    // UI state
    const [loadingSidebar, setLoadingSidebar] = useState(true)
    const [loadingChat, setLoadingChat] = useState(false)
    const [sending, setSending] = useState(false)
    
    // Refs
    const messagesEndRef = useRef(null)
    const pollingIntervalRef = useRef(null)
    const lastMessageIdRef = useRef(null)

    // Unified API Base
    const getApiBase = (kelasId) => `/class/${kelasId}`

    useEffect(() => {
        const fetchKelasSidebar = async () => {
            try {
                const res = await api.get('/my-classes')
                console.log('My Classes API Response:', res.data)
                
                // My unified API returns { success: true, data: [...] }
                // So list should be res.data.data
                const list = res.data.data || []
                
                setKelasList(list)

                // If no selected class, pick the first one
                if (!selectedKelasId && list?.length > 0) {
                    setSelectedKelasId(list[0].id)
                }
            } catch (error) {
                console.error('Fetch kelas Error', error)
                toast.error('Gagal mengambil daftar kelas')
            } finally {
                setLoadingSidebar(false)
            }
        }
        fetchKelasSidebar()
    }, [selectedKelasId])

    // 2. Fetch Chat & Info for Selected Kelas
    useEffect(() => {
        if (!selectedKelasId) {
            setKelasInfo(null)
            setMessages([])
            return
        }

        const fetchFullDiskusi = async () => {
            setLoadingChat(true)
            try {
                const apiBase = getApiBase(selectedKelasId)
                
                // Fetch info, members & initial chat parallel
                const [resInfo, resChat, resMembers] = await Promise.all([
                    api.get(`${apiBase}/info`),
                    api.get(`${apiBase}/messages`),
                    api.get(`${apiBase}/members`)
                ])
                
                const infoData = resInfo.data.data || resInfo.data
                setKelasInfo({
                    ...infoData,
                    members: resMembers.data.data || []
                })
                
                const msgs = resChat.data.data || []
                const orderedMsgs = Array.isArray(msgs) ? msgs.reverse() : (msgs.data ? msgs.data.reverse() : [])
                setMessages(orderedMsgs)
                
                if (orderedMsgs.length > 0) {
                    lastMessageIdRef.current = orderedMsgs[orderedMsgs.length - 1].id
                } else {
                    lastMessageIdRef.current = null
                }
                
                scrollToBottom()
            } catch (error) {
                console.error('Fetch Chat Error', error)
                toast.error('Gagal mengambil data diskusi')
            } finally {
                setLoadingChat(false)
            }
        }

        fetchFullDiskusi()
        startPolling()

        return () => stopPolling()
    }, [selectedKelasId])

    // 3. Polling Logic
    const startPolling = () => {
        stopPolling()
        pollingIntervalRef.current = setInterval(async () => {
            if (!selectedKelasId) return
            
            try {
                const afterId = lastMessageIdRef.current
                if (!afterId) return // If no messages, you might use a normal fetch or skip polling. For simplicity, we skip polling empty chats. We could just fetch the first page again.

                const apiBase = getApiBase(selectedKelasId)
                const res = await api.get(`${apiBase}/messages?after_id=${afterId}`)
                const newMsgs = res.data.data || []

                if (newMsgs.length > 0) {
                    setMessages(prev => [...prev, ...newMsgs])
                    lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id
                    scrollToBottom()
                }
            } catch (error) {
                // Silent error for polling
            }
        }, 5000)
    }

    const stopPolling = () => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const formatClassName = (name, semester) => {
        if (!name) return '-'
        if (name.toUpperCase().startsWith('R') && name.length >= 2) {
            return `R${semester}${name.substring(1)}`
        }
        return name
    }

    // Handlers
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedKelasId) return

        setSending(true)
        const text = newMessage
        setNewMessage('')
        const apiBase = getApiBase(selectedKelasId)

        try {
            if (editingMessage) {
                const res = await api.put(`${apiBase}/messages/${editingMessage.id}`, { pesan: text })
                const data = res.data.data || res.data
                setMessages(prev => prev.map(m => m.id === editingMessage.id ? data : m))
                setEditingMessage(null)
                toast.success('Pesan diedit')
            } else {
                const res = await api.post(`${apiBase}/messages`, { pesan: text })
                const data = res.data.data || res.data
                setMessages(prev => [...prev, data])
                lastMessageIdRef.current = data.id
                scrollToBottom()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memproses pesan')
            setNewMessage(text) // restore on error
        } finally {
            setSending(false)
        }
    }

    const handleDelete = async (msgId) => {
        if (!window.confirm('Hapus pesan ini?')) return

        try {
            const apiBase = getApiBase(selectedKelasId)
            await api.delete(`${apiBase}/messages/${msgId}`)
            
            // update UI locally (soft delete representation)
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted_at: new Date().toISOString() } : m))
            toast.success('Pesan dihapus')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus pesan')
        }
    }

    const handleEditClick = (msg) => {
        setEditingMessage(msg)
        setNewMessage(msg.pesan)
    }

    const cancelEdit = () => {
        setEditingMessage(null)
        setNewMessage('')
    }

    const formatTime = (dateString) => {
        const d = new Date(dateString)
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }

    if (loadingSidebar && !kelasList.length) {
        return <div className="flex justify-center flex-1 items-center h-[calc(100vh-12rem)]"><RefreshCw className="w-8 h-8 animate-spin text-brand-600" /></div>
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 relative">
            {/* Sidebar Kelas Lists */}
            <Card className="w-full md:w-80 flex-shrink-0 flex flex-col h-1/3 md:h-full overflow-hidden border-gray-200 dark:border-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 flex-shrink-0 py-4">
                    <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                        <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Pilih Kelas
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                    {kelasList.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">Info kelas tidak tersedia.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {kelasList.map(k => (
                                <li key={k.id}>
                                    <button
                                        onClick={() => setSelectedKelasId(k.id)}
                                        className={`w-full text-left px-5 py-4 transition-colors flex flex-col gap-1 ${
                                            Number(selectedKelasId) === Number(k.id) 
                                            ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500' 
                                            : 'border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className={`text-sm font-semibold truncate ${Number(selectedKelasId) === Number(k.id) ? 'text-brand-900 dark:text-brand-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {k.nama_kelas || k.mata_kuliah?.nama || 'Kelas Tanpa Nama'}
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1">
                                            {formatClassName(k.nama_kelas, k.semester)}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col h-2/3 md:h-full overflow-hidden border border-brand-100 dark:border-brand-900/50 bg-white dark:bg-gray-900 shadow-sm relative">
                {!selectedKelasId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 space-y-4">
                        <MessageSquare className="w-16 h-16 opacity-30 text-brand-200" />
                        <p className="text-sm">Pilih kelas di sidebar untuk bergabung ke diskusi</p>
                    </div>
                ) : loadingChat ? (
                    <div className="flex-1 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <div className="flex flex-1 h-full overflow-hidden">
                        {/* Chat Context */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden border-r dark:border-gray-800">
                             {/* Chat Header Detailed */}
                            <div className="px-6 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 shadow-sm z-10">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg sm:text-xl truncate">
                                    {kelasInfo?.nama_kelas || 'Informasi Kelas'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    <span className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-0.5 rounded-full">
                                        Semester {kelasInfo?.semester || '-'}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                        TA {kelasInfo?.tahun_ajaran || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Chat Context/Body */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f4f7f6] dark:bg-gray-950 space-y-6 relative custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="text-sm max-w-sm">Jadilah yang pertama memulai diskusi akademik di kelas ini.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isSentByMe = Boolean(msg.user_id === user.id)
                                        const isDosen = Boolean(msg.user?.role === 'dosen')
                                        const isAdmin = Boolean(msg.user?.role === 'admin')
                                        const isDeleted = Boolean(msg.deleted_at)
                                        const isEdited = Boolean(msg.edited_at)
                                        
                                        // 1 Hour rule check
                                        const createdDate = new Date(msg.created_at)
                                        const diffMins = (new Date() - createdDate) / (1000 * 60)
                                        const canEditDelete = isSentByMe && diffMins <= 60 && !isDeleted

                                        if (isDeleted) {
                                            return (
                                                <div key={msg.id || idx} className={`flex max-w-[80%] ${isSentByMe ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                                                    <div className="bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 italic px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                                                        <Trash2 className="w-3 h-3" /> Pesan telah dihapus.
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div key={msg.id || idx} className={`flex flex-col group ${isSentByMe ? 'items-end' : 'items-start'}`}>
                                                {!isSentByMe && (
                                                    <div className="flex items-center gap-1.5 px-2 mb-1">
                                                        <span className={`text-xs font-bold leading-tight ${isAdmin ? 'text-purple-600' : isDosen ? 'text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {msg.user?.name}
                                                        </span>
                                                        {isAdmin ? <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 rounded font-bold uppercase">Admin</span> : isDosen ? <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-1.5 rounded font-bold uppercase">Dosen</span> : null}
                                                    </div>
                                                )}

                                                <div className={`relative flex items-center gap-2 ${isSentByMe ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] sm:max-w-[70%]`}>
                                                    {canEditDelete && (
                                                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ${isSentByMe ? '-mr-2' : '-ml-2'}`}>
                                                            <button onClick={() => handleEditClick(msg)} className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed rounded-2xl ${isSentByMe ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-sm border dark:border-gray-700'}`}>
                                                        <p className="whitespace-pre-wrap">{msg.pesan}</p>
                                                        <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isSentByMe ? 'text-brand-200' : 'text-gray-400'} text-[10px]`}>
                                                            {isEdited && <span>(diedit)</span>}
                                                            <span>{formatTime(msg.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 shrink-0">
                                {editingMessage && (
                                    <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-t-xl text-xs mb-[-5px] border border-yellow-200 dark:border-yellow-800">
                                        <div className="flex gap-2 items-center text-yellow-800"><Edit2 className="w-3 h-3" /> Mengedit pesan...</div>
                                        <button onClick={cancelEdit}><X className="w-3 h-3" /></button>
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50/50 dark:bg-gray-800/50 p-2 rounded-2xl border dark:border-gray-700">
                                    <textarea
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none dark:text-gray-100 min-h-[44px] max-h-32"
                                        placeholder="Tulis balasan diskusi..."
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value)
                                            e.target.style.height = 'auto'
                                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                    />
                                    <button type="submit" disabled={sending || !newMessage.trim()} className={`shrink-0 mb-1 mr-1 p-2.5 rounded-full transition-all ${newMessage.trim() ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                        {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Members Sidebar (Desktop only) */}
                        <div className="hidden xl:flex w-72 flex-col bg-gray-50 dark:bg-gray-900 border-l dark:border-gray-800 overflow-hidden">
                            <div className="px-5 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brand-600" /> Anggota Kelas
                                </h4>
                                <p className="text-[10px] text-gray-500 mt-0.5">{kelasInfo?.members?.length || 0} orang tergabung</p>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                <div className="space-y-4 p-2">
                                    {/* Dosen Section */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">Dosen & Staff</p>
                                        <div className="space-y-1">
                                            {kelasInfo?.members?.filter(m => m.role === 'dosen').map(m => (
                                                <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
                                                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm shrink-0 border-2 border-white dark:border-gray-800 shadow-sm">
                                                        {m.avatar ? <img src={m.avatar} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-brand-600 transition-colors">{m.name}</p>
                                                        <p className="text-[10px] text-brand-600 font-medium">{m.type}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mahasiswa Section */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">Mahasiswa</p>
                                        <div className="space-y-1">
                                            {kelasInfo?.members?.filter(m => m.role === 'mahasiswa').map(m => (
                                                <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs shrink-0 font-medium uppercase">
                                                        {m.avatar ? <img src={m.avatar} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{m.name}</p>
                                                        <p className="text-[9px] text-gray-400">Mahasiswa</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Chat
