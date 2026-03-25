import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  LogOut,
  X,
  UserCheck,
  Award,
  BookMarked,
  Bell,
  MessageSquare,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'

const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Profil', path: '/profile', icon: UserCheck },
    { name: 'Data Dosen', path: '/admin/data-dosen', icon: UserCheck },
    { name: 'Data Mahasiswa', path: '/admin/data-mahasiswa', icon: GraduationCap },
    { name: 'Data Kelas', path: '/admin/data-kelas', icon: BookOpen },
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
    { name: 'Profil', path: '/profile', icon: UserCheck },
    { name: 'Data Kelas', path: '/admin/data-kelas', icon: BookOpen },
    { name: 'Jadwal Hari Ini', path: '/dosen/dashboard', icon: Calendar },
    { name: 'Kelola Quiz', path: '/dosen/quiz', icon: BookMarked },
    { name: 'Chat Kelas', path: '/dosen/chat', icon: MessageSquare },
    { name: 'Kirim Notifikasi', path: '/dosen/notifikasi', icon: Bell },
  ]

  const mahasiswaMenu = [
    { name: 'Dashboard', path: '/mahasiswa/dashboard', icon: LayoutDashboard },
    { name: 'Profil', path: '/profile', icon: UserCheck },
    { name: 'Jadwal Kuliah', path: '/mahasiswa/jadwal', icon: Calendar },
    { name: 'Nilai Akademik', path: '/mahasiswa/nilai', icon: Award },
    { name: 'Absensi', path: '/mahasiswa/absensi', icon: UserCheck },
    { name: 'Chat Kelas', path: '/mahasiswa/chat', icon: MessageSquare },
  ]

  let menu = []
  if (user?.role === 'admin') menu = adminMenu
  if (user?.role === 'dosen') menu = dosenMenu
  if (user?.role === 'mahasiswa') menu = mahasiswaMenu

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar_collapsed', JSON.stringify(next))
  }

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
        className={`fixed inset-y-0 left-0 z-50 transform border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'lg:w-[4.5rem]' : 'lg:w-72'}
          ${isOpen ? 'w-72' : 'w-72'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={`flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
            <Link to="/" className={`flex items-center gap-2 font-bold text-brand-600 dark:text-brand-400 ${collapsed ? 'text-lg' : 'text-xl'}`}>
              <BookOpen className="h-6 w-6 shrink-0" />
              {!collapsed && <span className="transition-opacity duration-200">EduLMS</span>}
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
          <nav className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-4'} space-y-1`}>
            {menu.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                    }`}
                  />
                  {!collapsed && item.name}
                  
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 hidden group-hover:flex items-center z-50 pointer-events-none">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
                        {item.name}
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Collapse Toggle (desktop only) */}
          <div className="hidden lg:flex border-t border-gray-200 dark:border-gray-800 p-2">
            <button
              onClick={toggleCollapse}
              className={`flex items-center w-full rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 ${
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
              }`}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* Logout footer */}
          <div className={`border-t border-gray-200 dark:border-gray-800 ${collapsed ? 'p-2' : 'p-4'}`}>
            <button
              onClick={logout}
              className={`flex w-full items-center rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
              }`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
