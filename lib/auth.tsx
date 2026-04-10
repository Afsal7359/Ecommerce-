'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { authAPI } from './api'

interface User { _id: string; name: string; email: string; role: string; avatar: string; phone?: string; isVerified?: boolean; totalOrders?: number; totalSpent?: number; wishlist?: string[]; addresses?: any[] }
interface AuthCtx {
  user: User | null; token: string | null; loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  isAdmin: boolean; isSuperAdmin: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = Cookies.get('token') || localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    setLoading(false)
  }, [])

  const persist = (res: any) => {
    Cookies.set('token', res.token, { expires: 7, sameSite: 'lax' })
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.token); setUser(res.user)
  }

  const login    = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login({ email, password }) as any
    persist(res)
  }, [])

  const register = useCallback(async (data: any) => {
    const res = await authAPI.register(data) as any
    persist(res)
  }, [])

  const logout = useCallback(() => {
    Cookies.remove('token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null); setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <Ctx.Provider value={{
      user, token, loading, login, register, logout,
      isAdmin:      ['admin','superadmin'].includes(user?.role || ''),
      isSuperAdmin: user?.role === 'superadmin',
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
