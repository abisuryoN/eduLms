import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, X } from 'lucide-react'
import api from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

export const ModalKelasForm = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reference Data
  const [fakultasList, setFakultasList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [matkulList, setMatkulList] = useState([])
  const [dosenList, setDosenList] = useState([])
  
  // Options Data
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [semesterOptions, setSemesterOptions] = useState([])

  // Form State
  const [formData, setFormData] = useState({
    fakultas_id: '',
    prodi_id: '',
    tahun_ajaran: '',
    semester: '',
    dosen_pa_id: '',
    kelas_list: [
        { nama_kelas: '', mata_kuliah_id: '', dosen_id: '' }
    ]
  })

  // Fetch initial references
  useEffect(() => {
    if (isOpen) {
        setStep(1)
        setFormData({
            fakultas_id: '',
            prodi_id: '',
            tahun_ajaran: '',
            semester: '',
            dosen_pa_id: '',
            kelas_list: [{ nama_kelas: '', mata_kuliah_id: '', dosen_id: '' }]
        })
        fetchInitialData()
    }
  }, [isOpen])

  const fetchInitialData = async () => {
    try {
      const [resReferensi] = await Promise.all([
        api.get('/admin/referensi/options')
      ])
      
      setFakultasList(resReferensi.data.fakultas)
      setTahunAjaranOptions(resReferensi.data.tahun_ajaran)
      setSemesterOptions(resReferensi.data.semester)
      
      // Select defaults for dropdowns if available
      if (resReferensi.data.tahun_ajaran.length > 0) {
        setFormData(prev => ({ ...prev, tahun_ajaran: resReferensi.data.tahun_ajaran[0] }))
      }
      if (resReferensi.data.semester.length > 0) {
        setFormData(prev => ({ ...prev, semester: resReferensi.data.semester[0] }))
      }
    } catch (error) {
      toast.error('Gagal memuat data referensi awal')
    }
  }

  // Effect to fetch Prodi when Fakultas changes
  useEffect(() => {
    const fetchProdi = async () => {
      if (!formData.fakultas_id) {
          setProdiList([])
          return;
      }
      try {
        const res = await api.get(`/admin/prodi?fakultas_id=${formData.fakultas_id}`)
        setProdiList(res.data.data || res.data)
        setFormData(prev => ({ ...prev, prodi_id: '' }))
      } catch (error) {
        toast.error('Gagal memuat prodi')
      }
    }
    fetchProdi()
  }, [formData.fakultas_id])

  // Effect to fetch Mata Kuliah when Prodi & Semester changes
  useEffect(() => {
    const fetchMatkul = async () => {
        if (!formData.prodi_id || !formData.semester) {
            setMatkulList([])
            return;
        }
        try {
            const res = await api.get(`/admin/mata-kuliah?prodi_id=${formData.prodi_id}&semester=${formData.semester}`)
            setMatkulList(res.data.data || res.data)
        } catch (error) {
            toast.error('Gagal memuat mata kuliah')
        }
    }
    fetchMatkul()
  }, [formData.prodi_id, formData.semester])

  // Effect to fetch Dosen when Prodi is selected
  useEffect(() => {
    const fetchDosen = async () => {
        if (!formData.prodi_id) {
            setDosenList([])
            return;
        }
        try {
            const res = await api.get(`/admin/dosen?prodi_id=${formData.prodi_id}&per_page=1000`)
            setDosenList(res.data.data || res.data)
        } catch (error) {
            // Optional: you can toaster error here if you'd like
        }
    }
    fetchDosen()
  }, [formData.prodi_id])


  const addKelasRow = () => {
    setFormData(prev => ({
        ...prev,
        kelas_list: [...prev.kelas_list, { nama_kelas: '', mata_kuliah_id: '', dosen_id: '' }]
    }))
  }

  const removeKelasRow = (index) => {
    if (formData.kelas_list.length === 1) return;
    setFormData(prev => {
        const newList = [...prev.kelas_list]
        newList.splice(index, 1)
        return { ...prev, kelas_list: newList }
    })
  }

  const handleKelasChange = (index, field, value) => {
    setFormData(prev => {
        const newList = [...prev.kelas_list]
        newList[index][field] = value
        return { ...prev, kelas_list: newList }
    })
  }

  const validateStep1 = () => {
      if (!formData.fakultas_id || !formData.prodi_id || !formData.tahun_ajaran || !formData.semester) {
          toast.error("Semua field di Tahap 1 wajib diisi")
          return false
      }
      return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validations
    let hasError = false
    formData.kelas_list.forEach(k => {
        if (!k.nama_kelas || !k.mata_kuliah_id || !k.dosen_id) hasError = true
    })

    if (hasError) {
        toast.error("Semua field mata kuliah dan dosen pengajar wajib diisi")
        return
    }

    setIsSubmitting(true)

    try {
        // Send individually or API batch process (we use individual based on current API endpoints, could be refactored to batched)
        let successCount = 0;
        let errorCount = 0;

        for (const k of formData.kelas_list) {
             try {
                await api.post('/admin/kelas', {
                    fakultas_id: formData.fakultas_id,
                    prodi_id: formData.prodi_id,
                    tahun_ajaran: formData.tahun_ajaran,
                    semester: formData.semester,
                    dosen_pa_id: formData.dosen_pa_id || null,
                    nama_kelas: k.nama_kelas,
                    mata_kuliah_id: k.mata_kuliah_id,
                    dosen_id: k.dosen_id
                })
                successCount++;
             } catch (err) {
                console.error("Gagal create kelas", err);
                errorCount++;
             }
        }

        if (errorCount > 0) {
            toast.error(`Berhasil membuat ${successCount} kelas, Gagal ${errorCount} kelas.`)
        } else {
            toast.success(`Berhasil membuat ${successCount} kelas baru!`)
        }
        
        onSuccess()
        onClose()
    } catch (error) {
      toast.error('Terjadi kesalahan yang tidak terduga')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Tambah Kelas Dinamis"
      maxWidth="max-w-3xl"
    >
      <div className="p-2">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>1</div>
                <span className="text-xs font-semibold uppercase tracking-wider">Pilih Filter Dasar</span>
            </div>
            <div className={`w-24 h-[2px] mx-4 mb-6 ${step >= 2 ? 'bg-brand-600 dark:bg-brand-400' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>2</div>
                <span className="text-xs font-semibold uppercase tracking-wider">Set Matkul & Dosen</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1 */}
             {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Fakultas</label>
                            <select
                                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
                                value={formData.fakultas_id}
                                onChange={(e) => setFormData({...formData, fakultas_id: e.target.value})}
                                required
                            >
                                <option value="" disabled className="dark:bg-gray-800">Pilih Fakultas...</option>
                                {fakultasList.map(f => (
                                    <option key={f.id} value={f.id} className="dark:bg-gray-800">{f.kode} - {f.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Program Studi</label>
                            <select
                                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors disabled:opacity-50"
                                value={formData.prodi_id}
                                onChange={(e) => setFormData({...formData, prodi_id: e.target.value})}
                                required
                                disabled={!formData.fakultas_id}
                            >
                                <option value="" disabled className="dark:bg-gray-800">Pilih Prodi...</option>
                                {prodiList.map(p => (
                                    <option key={p.id} value={p.id} className="dark:bg-gray-800">{p.kode} - {p.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Tahun Ajaran</label>
                            <select
                                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
                                value={formData.tahun_ajaran}
                                onChange={(e) => setFormData({...formData, tahun_ajaran: e.target.value})}
                                required
                            >
                                <option value="" disabled className="dark:bg-gray-800">Pilih Tahun Ajaran...</option>
                                {tahunAjaranOptions.map(t => (
                                    <option key={t} value={t} className="dark:bg-gray-800">{t}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Semester</label>
                            <select
                                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
                                value={formData.semester}
                                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                                required
                            >
                                <option value="" disabled className="dark:bg-gray-800">Pilih Semester...</option>
                                {semesterOptions.map(s => (
                                    <option key={s} value={s} className="dark:bg-gray-800">{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-1">Dosen Pengampu Akademik (PA)</label>
                        <select
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2 px-3 border transition-colors"
                            value={formData.dosen_pa_id}
                            onChange={(e) => setFormData({...formData, dosen_pa_id: e.target.value})}
                        >
                            <option value="" className="dark:bg-gray-800">Opsional / Belum ada...</option>
                            {dosenList.map(dosen => (
                                <option key={`pa-${dosen.id}`} value={dosen.id} className="dark:bg-gray-800">{dosen.user?.name} ({dosen.id_kerja})</option>
                            ))}
                        </select>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          Dosen PA akan diterapkan kebanyak kelas yang dibuat secara bersamaan ini.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => {
                                if(validateStep1()) setStep(2)
                            }}
                        >
                            Lanjut ke Tahap 2
                        </Button>
                    </div>
                </div>
             )}


             {/* STEP 2 */}
             {step === 2 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/40 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 uppercase tracking-wide">
                                Data Terpilih
                            </h4>
                            <p className="text-sm text-brand-700 dark:text-brand-300/70 mt-1">
                                Sem: {formData.semester} | TA: {formData.tahun_ajaran}
                            </p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} className="bg-white dark:bg-gray-800">
                            Ubah Target
                        </Button>
                    </div>

                    <div className="space-y-3 pt-2">
                        {formData.kelas_list.map((kelasItem, idx) => (
                            <div key={idx} className="relative flex flex-col md:flex-row gap-3 items-end p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
                                <div className="absolute -left-2 -top-2 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-xs font-bold border border-brand-200 dark:border-brand-800 shadow-sm z-10">
                                    {idx + 1}
                                </div>
                                <div className="w-full md:w-1/4">
                                     <label className="block text-xs font-semibold leading-6 text-gray-500 dark:text-gray-400 mb-1">Nama Kelas</label>
                                     <Input
                                        type="text"
                                        placeholder="Misal: R6A"
                                        value={kelasItem.nama_kelas}
                                        onChange={(e) => handleKelasChange(idx, 'nama_kelas', e.target.value)}
                                        required
                                     />
                                </div>
                                <div className="w-full md:w-2/5">
                                     <label className="block text-xs font-semibold leading-6 text-gray-500 dark:text-gray-400 mb-1">Mata Kuliah</label>
                                     <select
                                        className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5 px-3 border transition-colors h-[42px]"
                                        value={kelasItem.mata_kuliah_id}
                                        onChange={(e) => handleKelasChange(idx, 'mata_kuliah_id', e.target.value)}
                                        required
                                     >
                                         <option value="" disabled className="dark:bg-gray-800">Pilih Matkul...</option>
                                         {matkulList.map(mk => (
                                             <option key={mk.id} value={mk.id} className="dark:bg-gray-800">{mk.nama} ({mk.sks} SKS)</option>
                                         ))}
                                         {matkulList.length === 0 && <option disabled>Tidak ada matkul.</option>}
                                     </select>
                                </div>
                                <div className="w-full md:w-2/5">
                                    <label className="block text-xs font-semibold leading-6 text-gray-500 dark:text-gray-400 mb-1">Dosen Pengajar</label>
                                    <select
                                        className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5 px-3 border transition-colors h-[42px]"
                                        value={kelasItem.dosen_id}
                                        onChange={(e) => handleKelasChange(idx, 'dosen_id', e.target.value)}
                                        required
                                    >
                                        <option value="" disabled className="dark:bg-gray-800">Pilih Dosen...</option>
                                        {dosenList.map(dosen => (
                                            <option key={`m-${dosen.id}`} value={dosen.id} className="dark:bg-gray-800">{dosen.user?.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="shrink-0 mb-1">
                                    <button
                                        type="button"
                                        onClick={() => removeKelasRow(idx)}
                                        disabled={formData.kelas_list.length === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-gray-50 dark:bg-gray-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                         <Button 
                             type="button" 
                             variant="outline" 
                             className="w-full border-dashed border-2 py-6 text-gray-500 dark:text-gray-400 hover:bg-gray-50 hover:text-brand-600 dark:hover:bg-gray-800/50 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800/50 bg-transparent"
                             onClick={addKelasRow}
                         >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Baris Mata Kuliah Lainnya
                         </Button>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Simpan Kelas
                        </Button>
                    </div>
                 </div>
             )}
          </form>
      </div>
    </Modal>
  )
}
