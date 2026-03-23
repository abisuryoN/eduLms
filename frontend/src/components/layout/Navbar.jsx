import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { Bell, Menu, UserCircle, LogOut, Settings, Sun, Moon } from 'lucide-react'
import api from '../../lib/api'

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    // Fetch notifications
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifikasi?unread_only=1')
        if (res.data?.data) {
          setNotifs(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error)
      }
    }
    
    if (user) {
      fetchNotifs()
      const interval = setInterval(fetchNotifs, 60000) // Poll every 1m
      return () => clearInterval(interval)
    }
  }, [user])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifikasi/${id}/read`)
      setNotifs(notifs.filter(n => n.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifikasi/read-all')
      setNotifs([])
      setNotifOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-colors">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Placeholder for search or breadcrumbs */}
        <div className="flex flex-1 items-center font-medium text-gray-500">
          <span className="hidden sm:inline">Sistem Informasi Akademik & LMS</span>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Moon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen)
                setDropdownOpen(false)
              }}
              className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none transition-all"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {notifs.length > 0 && (
                <span className="absolute top-1.5 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none transform opacity-100 scale-100 transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifikasi</h3>
                  {notifs.length > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium"
                    >
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifs.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer block border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.judul}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.pesan}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen)
                setNotifOpen(false)
              }}
              className="-m-1.5 flex items-center p-1.5 gap-x-2 rounded-full hover:bg-gray-50 transition-all"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 overflow-hidden rounded-full bg-brand-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-200">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-brand-700 font-bold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-medium leading-6 text-gray-900 ml-2" aria-hidden="true">
                  {user?.name}
                </span>
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none transform opacity-100 scale-100 transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1 lg:hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                
                <Link
                  to="/profile"
                  className="flex px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <UserCircle className="h-4 w-4" /> Profil
                </Link>
                
                <div className="h-px bg-gray-100 my-1"></div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="flex w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
