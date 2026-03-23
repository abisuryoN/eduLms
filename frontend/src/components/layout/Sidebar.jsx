import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  LogOut,
  Menu,
  X,
  UserCheck,
  Award,
  BookMarked,
  Bell,
  MessageSquare
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Import Mahasiswa', path: '/admin/import-mahasiswa', icon: Users },
    { name: 'Import Dosen', path: '/admin/import-dosen', icon: UserCheck },
    { name: 'Mata Kuliah', path: '/admin/mata-kuliah', icon: BookOpen },
    { name: 'Manajemen Kelas', path: '/admin/manajemen-kelas', icon: BookOpen },
    { name: 'Jadwal Kuliah', path: '/admin/jadwal', icon: Calendar },
    { name: 'Assign Mahasiswa', path: '/admin/assign-mahasiswa', icon: Users },
    { name: 'Assign Dosen', path: '/admin/assign-dosen', icon: UserCheck },
    { name: 'Slider Login', path: '/admin/slider', icon: LayoutDashboard },
    { name: 'Kelola Notifikasi', path: '/admin/notifikasi', icon: Bell },
  ]

  const dosenMenu = [
    { name: 'Dashboard', path: '/dosen/dashboard', icon: LayoutDashboard },
    { name: 'Jadwal Hari Ini', path: '/dosen/dashboard', icon: Calendar },
    { name: 'Kelola Quiz', path: '/dosen/quiz', icon: BookMarked },
    { name: 'Chat Kelas', path: '/dosen/chat', icon: MessageSquare }, // Added Chat
    { name: 'Kirim Notifikasi', path: '/dosen/notifikasi', icon: Bell },
  ]

  const mahasiswaMenu = [
    { name: 'Dashboard', path: '/mahasiswa/dashboard', icon: LayoutDashboard },
    { name: 'Jadwal Kuliah', path: '/mahasiswa/jadwal', icon: Calendar },
    { name: 'Nilai Akademik', path: '/mahasiswa/nilai', icon: Award },
    { name: 'Absensi', path: '/mahasiswa/absensi', icon: UserCheck },
    { name: 'Chat Kelas', path: '/mahasiswa/chat', icon: MessageSquare },
  ]

  let menu = []
  if (user?.role === 'admin') menu = adminMenu
  if (user?.role === 'dosen') menu = dosenMenu
  if (user?.role === 'mahasiswa') menu = mahasiswaMenu

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-600 dark:text-brand-400">
              <BookOpen className="h-6 w-6" />
              EduLMS
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info (Mobile only) */}
          <div className="lg:hidden px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar 
                src={user?.avatar} 
                name={user?.name} 
                size="md" 
                className="ring-2 ring-brand-100 dark:ring-brand-900/50" 
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
