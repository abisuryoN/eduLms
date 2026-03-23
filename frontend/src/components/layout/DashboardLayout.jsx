import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import NotificationPrompt from '../NotificationPrompt'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
      {/* Sidebar - Handles both mobile & desktop */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />

        {/* Page Content scrollable area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
          {(user?.role === 'dosen' || user?.role === 'mahasiswa') && (
            <NotificationPrompt />
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
