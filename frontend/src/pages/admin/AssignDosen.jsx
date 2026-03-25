import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'
import { toast } from 'react-hot-toast'
import { Users, GraduationCap, CheckCircle, Search, Loader2, X, UserCheck } from 'lucide-react'
import api from '../../lib/api'

const AssignDosen = () => {
  const [activeTab, setActiveTab] = useState('pengajar')

  // Reference data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [matkulList, setMatkulList] = useState([])
  const [kelasList, setKelasList] = useState([])

  // Filters
  const [selectedFakultas, setSelectedFakultas] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('')

  // Selected dosen (from modal)
  const [selectedDosen, setSelectedDosen] = useState(null)
  const [selectedMatkul, setSelectedMatkul] = useState('')
  const [selectedKelas, setSelectedKelas] = useState([])

  // Modal state
  const [isDosenModalOpen, setIsDosenModalOpen] = useState(false)
  const [dosenModalData, setDosenModalData] = useState(null)
  const [dosenModalSearch, setDosenModalSearch] = useState('')
  const [dosenModalDebouncedSearch, setDosenModalDebouncedSearch] = useState('')
  const [dosenModalPage, setDosenModalPage] = useState(1)
  const [dosenModalLoading, setDosenModalLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingRef, setLoadingRef] = useState(true)

  const debounceRef = useRef(null)

  // Fetch reference data
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const res = await api.get('/admin/referensi/options')
        setFakultasList(res.data.fakultas || [])
      } catch { /* silent */ } finally {
        setLoadingRef(false)
      }
    }
    fetchRef()
  }, [])

  // When fakultas changes → fetch prodi
  useEffect(() => {
    setProdiList([])
    setSelectedProdi('')
    setSelectedDosen(null)
    if (!selectedFakultas) return
    const fetchProdi = async () => {
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${selectedFakultas}`)
        setProdiList(res.data.data || res.data)
      } catch { /* silent */ }
    }
    fetchProdi()
  }, [selectedFakultas])

  // When prodi changes → fetch matkul & kelas
  useEffect(() => {
    setMatkulList([])
    setKelasList([])
    setSelectedMatkul('')
    setSelectedKelas([])
    setSelectedDosen(null)
    if (!selectedProdi) return
    const fetchData = async () => {
      try {
        const [resMk, resKelas] = await Promise.all([
          api.get(`/admin/mata-kuliah?prodi_id=${selectedProdi}`),
          api.get(`/admin/kelas?per_page=100`),
        ])
        setMatkulList(resMk.data.data || resMk.data)
        const allKelas = resKelas.data.data || resKelas.data
        setKelasList(allKelas.filter(k => String(k.prodi_id) === String(selectedProdi)))
      } catch { /* silent */ }
    }
    fetchData()
  }, [selectedProdi])

  // Debounce dosen modal search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDosenModalDebouncedSearch(dosenModalSearch)
      setDosenModalPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [dosenModalSearch])

  // Fetch dosen inside modal (server-side)
  const fetchDosenModal = useCallback(async () => {
    if (!isDosenModalOpen || !selectedProdi) return
    setDosenModalLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', dosenModalPage)
      params.set('per_page', 10)
      params.set('prodi_id', selectedProdi)
      if (selectedFakultas) params.set('fakultas_id', selectedFakultas)
      if (dosenModalDebouncedSearch) params.set('search', dosenModalDebouncedSearch)

      const res = await api.get(`/admin/dosen?${params.toString()}`)
      setDosenModalData(res.data)
    } catch {
      setDosenModalData(null)
    } finally {
      setDosenModalLoading(false)
    }
  }, [isDosenModalOpen, selectedProdi, selectedFakultas, dosenModalPage, dosenModalDebouncedSearch])

  useEffect(() => {
    fetchDosenModal()
  }, [fetchDosenModal])

  const openDosenModal = () => {
    if (!selectedProdi) {
      toast.error('Pilih Fakultas dan Prodi terlebih dahulu')
      return
    }
    setDosenModalSearch('')
    setDosenModalDebouncedSearch('')
    setDosenModalPage(1)
    setIsDosenModalOpen(true)
  }

  const selectDosen = (dosen) => {
    setSelectedDosen(dosen)
    setIsDosenModalOpen(false)
  }

  const handleKelasToggle = (kelasId) => {
    if (selectedKelas.includes(kelasId)) {
      setSelectedKelas(selectedKelas.filter(id => id !== kelasId))
    } else {
      setSelectedKelas([...selectedKelas, kelasId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDosen) return toast.error('Pilih dosen terlebih dahulu')
    if (activeTab === 'pengajar' && !selectedMatkul) return toast.error('Pilih mata kuliah')
    if (selectedKelas.length === 0) return toast.error('Pilih minimal satu kelas')

    setLoading(true)
    try {
      const payload = {
        dosen_id: selectedDosen.id,
        kelas_ids: selectedKelas.map(id => parseInt(id))
      }

      let endpoint = ''
      if (activeTab === 'pengajar') {
        payload.mata_kuliah_id = parseInt(selectedMatkul)
        endpoint = '/admin/assign-pengajar'
      } else {
        endpoint = '/admin/assign-pa'
      }

      const res = await api.post(endpoint, payload)
      toast.success(res.data.message || 'Penugasan berhasil disimpan')
      setSelectedDosen(null)
      setSelectedMatkul('')
      setSelectedKelas([])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const dosenModalList = dosenModalData?.data || []
  const dosenModalTotalPages = dosenModalData?.last_page || 1
  const dosenModalTotal = dosenModalData?.total || 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Penugasan Dosen</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola penugasan dosen sebagai Pengajar Mata Kuliah dan Pembimbing Akademik.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          className={`flex items-center gap-2 py-3 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === 'pengajar'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
          onClick={() => { setActiveTab('pengajar'); setSelectedKelas([]); setSelectedMatkul(''); }}
        >
          <GraduationCap className="h-4 w-4" />
          Dosen Pengajar
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === 'pa'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
          onClick={() => { setActiveTab('pa'); setSelectedKelas([]); }}
        >
          <Users className="h-4 w-4" />
          Pembimbing Akademik
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Form Penugasan {activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing Akademik'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Fakultas & Prodi Filter */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Step 1 — Pilih Fakultas & Prodi
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fakultas</label>
                  <select
                    value={selectedFakultas}
                    onChange={(e) => setSelectedFakultas(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    disabled={loadingRef}
                  >
                    <option value="">-- Pilih Fakultas --</option>
                    {fakultasList.map(f => (
                      <option key={f.id} value={f.id}>{f.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi</label>
                  <select
                    value={selectedProdi}
                    onChange={(e) => setSelectedProdi(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    disabled={!selectedFakultas}
                  >
                    <option value="">-- Pilih Prodi --</option>
                    {prodiList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Select Dosen via Modal */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Step 2 — Pilih Dosen
              </p>
              {selectedDosen ? (
                <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                    {selectedDosen.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedDosen.user?.name}</p>
                    <p className="text-xs text-gray-500">{selectedDosen.id_kerja}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDosen(null)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button type="button" variant="secondary" onClick={openDosenModal} disabled={!selectedProdi}>
                  <UserCheck className="h-4 w-4 mr-2" /> Pilih Dosen
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 3: Mata Kuliah (pengajar only) */}
              {activeTab === 'pengajar' && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Step 3 — Pilih Mata Kuliah
                  </p>
                  <select
                    value={selectedMatkul}
                    onChange={(e) => setSelectedMatkul(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    disabled={!selectedProdi}
                  >
                    <option value="">-- Pilih Mata Kuliah --</option>
                    {matkulList.map(mk => (
                      <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama} ({mk.sks} SKS)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 4: Kelas Selection */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Step {activeTab === 'pengajar' ? '4' : '3'} — Pilih Kelas
                </p>
                <div className="max-h-52 overflow-y-auto space-y-2">
                  {kelasList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {selectedProdi ? 'Tidak ada kelas untuk prodi ini' : 'Pilih prodi terlebih dahulu'}
                    </p>
                  ) : (
                    kelasList.map(kelas => (
                      <label
                        key={kelas.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedKelas.includes(kelas.id)
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40'
                            : 'border-transparent hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          checked={selectedKelas.includes(kelas.id)}
                          onChange={() => handleKelasToggle(kelas.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Kelas {kelas.nama_kelas}
                          </span>
                          <span className="text-xs text-gray-500">
                            {kelas.tahun_ajaran} - Semester {kelas.semester}
                          </span>
                        </div>
                        {selectedKelas.includes(kelas.id) && (
                          <CheckCircle className="h-4 w-4 text-brand-500 ml-auto" />
                        )}
                      </label>
                    ))
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>{selectedKelas.length} kelas dipilih</span>
                  <button type="button" onClick={() => setSelectedKelas([])} className="text-red-500 hover:text-red-600">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="submit" disabled={loading} isLoading={loading}>
                Simpan Penugasan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dosen Selection Modal */}
      <Modal
        isOpen={isDosenModalOpen}
        onClose={() => setIsDosenModalOpen(false)}
        title="Pilih Dosen"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Search inside modal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama / NIDN..."
              value={dosenModalSearch}
              onChange={(e) => setDosenModalSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Dosen list */}
          <div className="max-h-[360px] overflow-y-auto space-y-1">
            {dosenModalLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))
            ) : dosenModalList.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Tidak ada dosen ditemukan</p>
              </div>
            ) : (
              dosenModalList.map(dosen => (
                <button
                  key={dosen.id}
                  type="button"
                  onClick={() => selectDosen(dosen)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-transparent hover:border-brand-200 dark:hover:border-brand-800 transition-all"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold shrink-0">
                    {dosen.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{dosen.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">NIDN: {dosen.id_kerja} — {dosen.prodi?.nama}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Modal pagination */}
          {!dosenModalLoading && dosenModalTotal > 10 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500">{dosenModalTotal} dosen ditemukan</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDosenModalPage(p => Math.max(1, p - 1))}
                  disabled={dosenModalPage === 1}
                  className="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  Prev
                </button>
                <span className="text-xs text-gray-500">{dosenModalPage} / {dosenModalTotalPages}</span>
                <button
                  type="button"
                  onClick={() => setDosenModalPage(p => Math.min(dosenModalTotalPages, p + 1))}
                  disabled={dosenModalPage === dosenModalTotalPages}
                  className="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default AssignDosen
