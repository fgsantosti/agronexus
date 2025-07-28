import { useState } from 'react'
import Cookies from 'js-cookie'

export interface AuthResponse {
  access: string
  refresh: string
  user: any
  propriedades: any[]
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [propriedades, setPropriedades] = useState<any[]>([])
  const [access, setAccess] = useState<string | null>(null)
  const [refresh, setRefresh] = useState<string | null>(null)

  async function login(username: string, password: string): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) {
        throw new Error('Usuário ou senha inválidos')
      }
      const data: AuthResponse = await res.json()
      setAccess(data.access)
      setRefresh(data.refresh)
      setUser(data.user)
      setPropriedades(data.propriedades || [])
      // Salvar tokens no localStorage e cookies (para SSR/middleware)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('propriedades', JSON.stringify(data.propriedades || []))
      Cookies.set('access', data.access, { path: '/', sameSite: 'lax' })
      Cookies.set('refresh', data.refresh, { path: '/', sameSite: 'lax' })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setUser(null)
    setAccess(null)
    setRefresh(null)
    setPropriedades([])
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    localStorage.removeItem('propriedades')
    Cookies.remove('access')
    Cookies.remove('refresh')
  }

  const handleAuthError = () => {
    console.warn('Token inválido ou expirado. Fazendo logout...')
    logout()
  }

  const isAuthenticated = () => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem('access')
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {
      'Content-Type': 'application/json',
    }
    
    const token = localStorage.getItem('access')
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
  }

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const authHeaders = getAuthHeaders()
    const headers = {
      ...authHeaders,
      ...(options.headers as Record<string, string> || {}),
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      handleAuthError()
      throw new Error('Token inválido ou expirado')
    }

    return response
  }

  return { 
    user, 
    propriedades, 
    access, 
    refresh, 
    loading, 
    error, 
    login, 
    logout, 
    handleAuthError,
    isAuthenticated,
    getAuthHeaders,
    makeAuthenticatedRequest,
  }
}
