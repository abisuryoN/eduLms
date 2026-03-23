import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from './ui/Button'

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      return
    }

    // Check if permission has already been answered (granted or denied)
    // Only show prompt if it's 'default' (meaning the user hasn't been asked yet)
    if (Notification.permission === 'default') {
      // Small delay to not overwhelm the user immediately upon login
      const timer = setTimeout(() => {
        const hasDismissed = sessionStorage.getItem('dismissed_notification_prompt')
        if (!hasDismissed) {
          setShowPrompt(true)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Here you could also send the subscription to the backend if using true push notifications
        console.log('Notification permission granted.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    } finally {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem('dismissed_notification_prompt', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-900/10 dark:ring-gray-700 p-6 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
          <Bell className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Aktifkan Notifikasi?
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Dapatkan pembaruan instan mengenai jadwal, materi baru, dan pengumuman kampus.
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleAllow} className="flex-1 justify-center text-sm py-2">
              Ya, Aktifkan
            </Button>
            <Button onClick={handleDismiss} variant="outline" className="flex-1 justify-center text-sm py-2">
              Nanti Saja
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPrompt
