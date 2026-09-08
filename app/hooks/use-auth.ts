import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '../../shared/types/realtime'

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
const LS_KEY = 'nwebsockets_auth'
const LS_TOKEN_KEY = 'nwebsockets_token_only' // Token disimpan terpisah untuk reconnect

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    // Clear if token has expired
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_TOKEN_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Load token saja (untuk reconnect tanpa login) */
function loadTokenOnly(): { token: string; expiresAt: number } | null {
  try {
    const raw = localStorage.getItem(LS_TOKEN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token: string; expiresAt: number }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(LS_TOKEN_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveToStorage(user: AuthUser): void {
  localStorage.setItem(LS_KEY, JSON.stringify(user))
  // Simpan token terpisah untuk reconnect
  localStorage.setItem(LS_TOKEN_KEY, JSON.stringify({ token: user.token, expiresAt: user.expiresAt }))
}

function clearStorage(): void {
  localStorage.removeItem(LS_KEY)
  // JANGAN hapus LS_TOKEN_KEY saat logout — token tetap valid untuk reconnect
}

function clearAllStorage(): void {
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem(LS_TOKEN_KEY)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthState {
  user: AuthUser | null
  /** Token yang tersimpan (untuk reconnect tanpa login) */
  savedToken: { token: string; expiresAt: number } | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  /** Hapus token dari server & local */
  deleteToken: () => Promise<void>
  /** Reconnect dengan token yang tersimpan */
  reconnect: () => Promise<boolean>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(() => loadFromStorage())
  const [savedToken, setSavedToken] = useState<{ token: string; expiresAt: number } | null>(() => loadTokenOnly())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-check localStorage on mount (SSR guard)
  useEffect(() => {
    setUser(loadFromStorage())
    setSavedToken(loadTokenOnly())
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })
      const data = await res.json() as {
        token?: string
        expiresAt?: number
        user?: { id: string; name: string; color: string; email: string }
        statusMessage?: string
      }
      if (!res.ok || !data.token || !data.user || !data.expiresAt) {
        setError(data.statusMessage ?? 'Login gagal.')
        return false
      }
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        color: data.user.color,
        token: data.token,
        expiresAt: data.expiresAt,
      }
      saveToStorage(authUser)
      setUser(authUser)
      setSavedToken({ token: authUser.token, expiresAt: authUser.expiresAt })
      return true
    } catch {
      setError('Tidak dapat terhubung ke server.')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password }),
      })
      const data = await res.json() as {
        token?: string
        expiresAt?: number
        user?: { id: string; name: string; color: string; email: string }
        statusMessage?: string
      }
      if (!res.ok || !data.token || !data.user || !data.expiresAt) {
        setError(data.statusMessage ?? 'Registrasi gagal.')
        return false
      }
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        color: data.user.color,
        token: data.token,
        expiresAt: data.expiresAt,
      }
      saveToStorage(authUser)
      setUser(authUser)
      setSavedToken({ token: authUser.token, expiresAt: authUser.expiresAt })
      return true
    } catch {
      setError('Tidak dapat terhubung ke server.')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /** Logout: disconnect WebSocket tapi token TETAP valid untuk reconnect */
  const logout = useCallback(async (): Promise<void> => {
    clearStorage() // Hapus user state, tapi token tetap di LS_TOKEN_KEY
    setUser(null)
    setError(null)
    setSavedToken(loadTokenOnly()) // Reload token dari storage
  }, [])

  /** Hapus token dari server & local (invalidate) */
  const deleteToken = useCallback(async (): Promise<void> => {
    const token = user?.token
    clearAllStorage()
    setUser(null)
    setSavedToken(null)
    setError(null)
    if (token) {
      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_token', token }),
        })
      } catch {
        // Ignore
      }
    }
  }, [user?.token])

  /** Reconnect dengan token yang tersimpan */
  const reconnect = useCallback(async (): Promise<boolean> => {
    const saved = loadTokenOnly()
    if (!saved) {
      setError('Tidak ada token tersimpan. Login dulu.')
      return false
    }
    // Set user dari saved token (tanpa email/name, cukup token saja)
    const authUser: AuthUser = {
      id: '',
      email: '',
      name: 'Token User',
      color: 'hsl(0 85% 60%)',
      token: saved.token,
      expiresAt: saved.expiresAt,
    }
    saveToStorage(authUser)
    setUser(authUser)
    setSavedToken(saved)
    return true
  }, [])

  return { user, savedToken, isLoading, error, login, register, logout, deleteToken, reconnect }
}
