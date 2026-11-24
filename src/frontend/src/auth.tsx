import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore } from './api'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from './types'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(tokenStore.get()))

  useEffect(() => {
    if (!tokenStore.get()) return
    api.me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const handleAuth = useCallback(({ token, user }: AuthResponse) => {
    tokenStore.set(token)
    setUser(user)
  }, [])

  const login = useCallback(async (data: LoginRequest) => handleAuth(await api.login(data)), [handleAuth])
  const register = useCallback(async (data: RegisterRequest) => handleAuth(await api.register(data)), [handleAuth])
  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}
