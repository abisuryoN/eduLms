import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Camera, Save, User as UserIcon, ShieldCheck, Lock } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

const Profile = () => {
  const { user, refreshUser } = useAuth()
  
  // Get initial values from relation based on role
  const profileDetails = user?.role === 'mahasiswa' ? user?.mahasiswa : user?.dosen
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    alamat: profileDetails?.alamat || '',
    no_hp: profileDetails?.no_hp || '',
    tempat_lahir: profileDetails?.tempat_lahir || '',
    jenis_kelamin: profileDetails?.jenis_kelamin || 'L',
    keahlian: profileDetails?.keahlian || '', // for dosen
  })
  
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', formData)
      toast.success('Profil berhasil diperbarui')
      await refreshUser() // Refresh auth context user data
    } catch (error) {
       toast.error(error.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordErrors({})
    
    try {
      await api.post('/change-password', passwordData)
      toast.success('Password berhasil diperbarui')
      setIsPasswordModalOpen(false)
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      })
    } catch (error) {
      if (error.response?.status === 422) {
        setPasswordErrors(error.response.data.errors || {})
      } else {
        toast.error(error.response?.data?.message || 'Gagal memperbarui password')
      }
    } finally {
      setPasswordSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Limit size to 2MB as per backend
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran limit foto maksimal 2MB')
      return
    }

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('photo', file)

    try {
      await api.post('/profile/photo', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Foto profil berhasil diperbarui')
      await refreshUser() // Refresh global user object to get new avatar URL
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengupload foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ubah biodata dan foto profil untuk ditampilkan di sistem akademik.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Photo Upload Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-gray-50">
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-gray-100 flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.includes('http') ? user.avatar : `${api.defaults.baseURL.replace('/api', '')}${user.avatar}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-300" />
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-brand-600 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-brand-700 hover:scale-105 transition-all"
                title="Ubah Foto"
                disabled={uploading}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/jpg" 
              onChange={handlePhotoUpload}
            />
            
            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
            <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mt-1">
              {user?.role}
            </p>
            {user?.role === 'mahasiswa' && (
               <p className="text-xs text-gray-400 mt-2 bg-white px-3 py-1 rounded-full border border-gray-100">{profileDetails?.nim}</p>
            )}
            {user?.role === 'dosen' && (
               <p className="text-xs text-gray-400 mt-2 bg-white px-3 py-1 rounded-full border border-gray-100">ID: {profileDetails?.id_kerja}</p>
            )}
          </Card>

          {/* Security Card */}
          <Card className="p-6 bg-amber-50 border-amber-100 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500 rounded-lg text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">Keamanan Akun</h3>
            </div>
            <p className="text-xs text-amber-800 mb-4 leading-relaxed">
              Disarankan untuk memperbarui password Anda secara berkala demi keamanan data akademik Anda.
            </p>
            <Button 
                variant="outline" 
                className="w-full bg-white border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                onClick={() => setIsPasswordModalOpen(true)}
            >
              <Lock className="w-4 h-4 mr-2" /> Ganti Password
            </Button>
          </Card>
        </div>

        {/* Biodata Form Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="border-b bg-gray-50">
              <CardTitle>Identitas Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Nama Lengkap" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                  <Input 
                    label="Email" 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                  <Input 
                    label="Nomor HP/WhatsApp" 
                    name="no_hp" 
                    value={formData.no_hp} 
                    onChange={handleChange} 
                  />
                  
                  {user?.role === 'mahasiswa' && (
                     <>
                        <Input 
                          label="Tempat Lahir" 
                          name="tempat_lahir" 
                          value={formData.tempat_lahir} 
                          onChange={handleChange} 
                        />
                        <div>
                          <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Jenis Kelamin</label>
                          <select
                            name="jenis_kelamin"
                            value={formData.jenis_kelamin}
                            onChange={handleChange}
                            className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                          >
                            <option value="L">Laki-Laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                        </div>
                     </>
                  )}

                  {user?.role === 'dosen' && (
                     <Input 
                        label="Keahlian Khusus" 
                        name="keahlian" 
                        value={formData.keahlian} 
                        onChange={handleChange} 
                        placeholder="Cth: Rekayasa Perangkat Lunak, Jaringan"
                      />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={4}
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                    placeholder="Alamat domisili saat ini..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                   <Button type="submit" isLoading={saving} className="min-w-40 flex items-center justify-center gap-2">
                     <Save className="w-4 h-4" /> Simpan Perubahan
                   </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Change Password Modal */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title="Ubah Password Akun"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input 
            label="Password Saat Ini" 
            type="password"
            name="current_password"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
            error={passwordErrors.current_password}
            required
            placeholder="Masukkan password default/lama"
          />
          <Input 
            label="Password Baru" 
            type="password"
            name="new_password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
            error={passwordErrors.new_password}
            required
            placeholder="Minimal 8 karakter"
          />
          <Input 
            label="Konfirmasi Password Baru" 
            type="password"
            name="new_password_confirmation"
            value={passwordData.new_password_confirmation}
            onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
            error={passwordErrors.new_password_confirmation}
            required
            placeholder="Ulangi password baru"
          />
          
          <div className="pt-4 flex flex-col gap-3">
             <Button type="submit" isLoading={passwordSaving} className="w-full py-2.5">
               Simpan Password
             </Button>
             <Button type="button" variant="ghost" className="w-full" onClick={() => setIsPasswordModalOpen(false)}>
               Batal
             </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Profile
