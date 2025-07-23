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
  }

  return { user, propriedades, access, refresh, loading, error, login, logout }
}
