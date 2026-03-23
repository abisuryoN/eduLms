import { useState } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const ImportMahasiswa = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Pilih file Excel terlebih dahulu')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      const res = await api.post('/admin/import-mahasiswa', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setResult(res.data)
      toast.success(res.data.message)
      setFile(null)
      // reset file input
      document.getElementById('file-upload').value = ''
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat import data')
      if (error.response?.data?.errors) {
        setResult({
          imported: 0,
          errors: error.response.data.errors
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data Mahasiswa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload file Excel (.xlsx/.csv) untuk mendaftarkan mahasiswa baru secara massal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Format File Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Kolom Wajib:
            </h4>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>nama (Text)</li>
              <li>tanggal_lahir (Format: YYYY-MM-DD)</li>
              <li>tanggal_masuk (Format: YYYY-MM-DD)</li>
              <li>email (Text, Optional tapi disarankan)</li>
              <li>kode_prodi (Text, sesuai kode di master prodi)</li>
            </ul>
            <p className="mt-3 text-xs text-blue-700 dark:text-blue-400 italic">
              * NIM, Akun Login, dan Password (default: tanggal_lahir) akan digenerate otomatis.
            </p>
          </div>

          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">{file ? file.name : 'Klik untuk upload'}</span>
                  {!file && ' atau drag & drop'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, XLS, CSV (MAX. 10MB)</p>
              </div>
              <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleImport} disabled={!file || loading} isLoading={loading}>
              Proses Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.imported > 0 && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/30 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Import Berhasil</h3>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  {result.imported} data mahasiswa berhasil ditambahkan ke database.
                </p>
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Gagal Mengimport {result.errors.length} Baris
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto bg-white dark:bg-gray-900 p-0">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {result.errors.map((err, idx) => {
                    if (typeof err === 'string') {
                      return (
                        <li key={idx} className="p-4 flex gap-4 text-sm">
                          <div className="text-red-600 dark:text-red-400 w-full">{err}</div>
                        </li>
                      )
                    }
                    return (
                      <li key={idx} className="p-4 flex gap-4 text-sm">
                        <span className="font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0">Baris {err.row || idx+1}</span>
                        <div className="text-red-600 dark:text-red-400">
                          {Array.isArray(err.errors) ? err.errors.map((msg, i) => (
                            <div key={i}>{msg}</div>
                          )) : err.message || JSON.stringify(err)}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default ImportMahasiswa
