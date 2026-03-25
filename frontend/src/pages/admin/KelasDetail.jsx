import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, BookOpen, Clock, ArrowLeft, MessageCircle } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PageSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const KelasDetail = () => {
    const { id } = useParams()
    const [kelas, setKelas] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/admin/kelas/${id}`)
            console.log('API Response:', res.data) // DEBUG
            setKelas(res.data.data || res.data)
        } catch (error) {
            toast.error('Gagal mengambil data kelas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDetail()
    }, [id])

    if (loading) return <PageSkeleton />

    if (!kelas) return (
        <div className="text-center py-20 text-gray-500">
            Kelas tidak ditemukan.
            <div className="mt-4">
                <Link to="/admin/data-kelas">
                    <Button variant="outline">Kembali</Button>
                </Link>
            </div>
        </div>
    )

    // Helper formatting
    const getHariIndex = (hari) => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].indexOf(hari) || 0;
    const sortedJadwal = kelas.jadwal?.slice().sort((a, b) => getHariIndex(a.hari) - getHariIndex(b.hari)) || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-row items-center gap-4">
                    <Link to="/admin/data-kelas">
                        <Button variant="secondary" size="sm" className="hidden sm:flex">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Detail Kelas {kelas.nama_kelas}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {kelas.prodi?.nama} ({kelas.prodi?.fakultas?.kode}) &bull; Semester {kelas.semester} &bull; TA {kelas.tahun_ajaran}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {console.log('Current Kelas State:', kelas)} {/* DEBUG inline */}
                    <Link to={`/admin/chat/kelas/${kelas.id}`}>
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <MessageCircle className="w-4 h-4" />
                            Hubungi Kelas
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kolom Kiri: Informasi Akademik */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="w-5 h-5 text-brand-500" />
                                Mata Kuliah & Pengajar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {kelas.teaching_assignments?.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {kelas.teaching_assignments.map(ta => (
                                        <li key={ta.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{ta.mata_kuliah?.nama}</p>
                                                <p className="text-sm text-gray-500">{ta.mata_kuliah?.kode} &bull; {ta.mata_kuliah?.sks} SKS</p>
                                            </div>
                                            <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{ta.dosen?.user?.name || 'Belum diatur'}</p>
                                                <p className="text-xs text-gray-500">Dosen Pengampu</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-sm">Belum ada mata kuliah yang didaftarkan.</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="w-5 h-5 text-brand-500" />
                                    Daftar Mahasiswa ({kelas.mahasiswa?.length || 0})
                                </CardTitle>
                                <Link to={`/admin/assign-mahasiswa?kelas_id=${kelas.id}`}>
                                    <Button variant="outline" size="sm">Kelola Mahasiswa</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            {kelas.mahasiswa?.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {kelas.mahasiswa.map(mhs => (
                                        <li key={mhs.id} className="p-3 sm:px-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{mhs.user?.name}</p>
                                                <p className="text-xs text-gray-500">{mhs.nim}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-sm">Belum ada mahasiswa di kelas ini.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Kolom Kanan: Jadwal & Dosen PA */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 pb-4 border-b border-blue-100 dark:border-blue-900/30">
                            <CardTitle className="text-base text-blue-800 dark:text-blue-300">Wali Kelas / Dosen PA</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {kelas.pembimbing_akademik?.length > 0 ? (
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{kelas.pembimbing_akademik[0].dosen?.user?.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">Bertanggung jawab atas bimbingan akademik kelas ini.</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Dosen PA belum ditetapkan.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-brand-500" />
                                Jadwal Perkuliahan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {sortedJadwal.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {sortedJadwal.map(jadwal => (
                                        <li key={jadwal.id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-md mb-2">
                                                        {jadwal.hari}
                                                    </span>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                        {jadwal.jam_mulai.substring(0, 5)} - {jadwal.jam_selesai.substring(0, 5)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        Ruang: {jadwal.ruangan || '-'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Lt: {jadwal.lantai || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    Jadwal belum tersedia.
                                    <div className="mt-3">
                                        <Link to="/admin/jadwal">
                                            <Button variant="outline" size="sm">Atur Jadwal</Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default KelasDetail
