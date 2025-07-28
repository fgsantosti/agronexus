import { useState, useEffect } from 'react'

export interface Propriedade {
  id: string
  nome: string
  proprietario: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
  localizacao: string
  area_total_ha: string
  coordenadas_gps?: any
  inscricao_estadual?: string
  cnpj_cpf?: string
  ativa: boolean
  data_criacao: string
  area_ocupada?: string
  taxa_ocupacao_global?: string
  total_animais?: number
  total_lotes?: number
  total_areas?: number
}

export function usePropriedades() {
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [loading, setLoading] = useState(true) // Inicializa como true para mostrar loading inicial
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  const fetchPropriedades = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/propriedades/`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const propriedadesData = data.results || data
      setPropriedades(propriedadesData)
      
      // Salva no localStorage para uso offline/fallback
      localStorage.setItem('propriedades', JSON.stringify(propriedadesData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar propriedades:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Só busca se tiver token de autenticação
    const token = localStorage.getItem('access')
    if (token) {
      fetchPropriedades()
    } else {
      setLoading(false) // Para de carregar se não tiver token
      // Verifica se há propriedades salvas no localStorage como fallback
      const savedPropriedades = localStorage.getItem('propriedades')
      if (savedPropriedades) {
        try {
          const parsed = JSON.parse(savedPropriedades)
          setPropriedades(Array.isArray(parsed) ? parsed : [])
        } catch (error) {
          console.error('Erro ao parsear propriedades do localStorage:', error)
        }
      }
    }
  }, [])

  return {
    propriedades,
    loading,
    error,
    refetch: fetchPropriedades,
  }
}
