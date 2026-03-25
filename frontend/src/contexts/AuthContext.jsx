import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/me')
      const userData = res.data.data || res.data.user || res.data
      setUser(userData)
    } catch (error) {
      console.error('Auth error:', error)
      localStorage.removeItem('token')
      setUser(null)
      
      // Only redirect to login if explicitly unauthenticated
      if (error.response && error.response.status === 401) {
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      // Explicitly use POST and provide data
      const res = await api({
        method: 'post',
        url: '/login',
        data: { username, password }
      })
      
      const token = res.data.token
      if (!token) throw new Error('Token tidak diterima dari server')
      
      localStorage.setItem('token', token)
      const userData = res.data.data || res.data.user || res.data
      setUser(userData)
      return res.data
    } catch (error) {
      console.error('Login service error:', error.response?.data || error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error(error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      window.location.href = '/login'
    }
  }

  // Refetch user data (e.g., after profile update)
  const refreshUser = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
