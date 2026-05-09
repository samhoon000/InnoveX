import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from 'shared/types'
import { apiFetch, getToken, setToken } from '@/lib/api'
import { resetMockProfileState } from '@/lib/mock-api'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<AuthUser>
  signup: (payload: { name: string; email: string; password: string; hospitalId: string }) => Promise<AuthUser>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await apiFetch<{ user: AuthUser & { notificationSettings?: unknown; milestoneIssued?: unknown } }>(
        '/api/auth/me'
      )
      const { notificationSettings: _n, milestoneIssued: _m, ...rest } = res.user
      setUser(rest as AuthUser)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const signup = useCallback(
    async (payload: { name: string; email: string; password: string; hospitalId: string }) => {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setToken(res.token)
      setUser(res.user)
      return res.user
    },
    []
  )

  const logout = useCallback(() => {
    resetMockProfileState()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      refresh,
    }),
    [user, loading, login, signup, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
