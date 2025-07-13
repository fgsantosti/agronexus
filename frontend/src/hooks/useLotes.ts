'use client'

import { useState, useEffect } from 'react'
import { Lote, LoteFormData, EstatisticasLote } from '@/types/lote'

interface UseLotesReturn {
  lotes: Lote[]
  loading: boolean
  error: string | null
  criarLote: (dados: LoteFormData) => Promise<boolean>
  atualizarLote: (id: string, dados: Partial<LoteFormData>) => Promise<boolean>
  excluirLote: (id: string) => Promise<boolean>
  obterLote: (id: string) => Lote | undefined
  obterEstatisticas: (id: string) => Promise<EstatisticasLote | null>
  alternarStatusLote: (id: string) => Promise<boolean>
  recarregarLotes: () => void
}

export function useLotes(): UseLotesReturn {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar lotes do localStorage (simulando API)
  const carregarLotes = () => {
    try {
      setLoading(true)
      const lotesArmazenados = localStorage.getItem('lotes')
      if (lotesArmazenados) {
        setLotes(JSON.parse(lotesArmazenados))
      } else {
        // Dados iniciais se não houver lotes
        const lotesIniciais: Lote[] = [
          {
            id: 'lote-1',
            propriedade: 'Fazenda Santa Maria',
            propriedade_id: 'prop-1',
            nome: 'Lote Novilhas',
            descricao: 'Novilhas de 18 a 24 meses para reprodução',
            criterio_agrupamento: 'Fêmeas 18-24 meses',
            area_atual: {
              id: 'area-1',
              nome: 'Pasto Norte',
              tipo: 'pastagem',
              tamanho_ha: 25.5,
              status: 'em_uso'
            },
            area_atual_id: 'area-1',
            aptidao: 'corte',
            finalidade: 'cria',
            sistema_criacao: 'extensivo',
            ativo: true,
            data_criacao: new Date().toISOString(),
            total_animais: 45,
            total_ua: 36.0,
            peso_medio: 380.5,
            gmd_medio: 0.850
          },
          {
            id: 'lote-2',
            propriedade: 'Fazenda Santa Maria',
            propriedade_id: 'prop-1',
            nome: 'Lote Bezerros',
            descricao: 'Bezerros desmamados em fase de recria',
            criterio_agrupamento: 'Machos até 12 meses',
            aptidao: 'corte',
            finalidade: 'recria',
            sistema_criacao: 'semi_extensivo',
            ativo: true,
            data_criacao: new Date().toISOString(),
            total_animais: 28,
            total_ua: 14.0,
            peso_medio: 180.2,
            gmd_medio: 0.650
          },
          {
            id: 'lote-3',
            propriedade: 'Fazenda Santa Maria',
            propriedade_id: 'prop-1',
            nome: 'Lote Reprodutores',
            descricao: 'Touros e reprodutores da propriedade',
            criterio_agrupamento: 'Machos reprodutores',
            area_atual: {
              id: 'area-2',
              nome: 'Piquete Central',
              tipo: 'piquete',
              tamanho_ha: 8.0,
              status: 'em_uso'
            },
            area_atual_id: 'area-2',
            aptidao: 'dupla_aptidao',
            finalidade: 'cria',
            sistema_criacao: 'intensivo',
            ativo: true,
            data_criacao: new Date().toISOString(),
            total_animais: 5,
            total_ua: 7.5,
            peso_medio: 650.0,
            gmd_medio: 0.200
          }
        ]
        setLotes(lotesIniciais)
        localStorage.setItem('lotes', JSON.stringify(lotesIniciais))
      }
    } catch (err) {
      setError('Erro ao carregar lotes')
      console.error('Erro ao carregar lotes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarLotes()
  }, [])

  // Salvar lotes no localStorage
  const salvarLotes = (novosLotes: Lote[]) => {
    try {
      localStorage.setItem('lotes', JSON.stringify(novosLotes))
      setLotes(novosLotes)
    } catch (err) {
      setError('Erro ao salvar lotes')
      console.error('Erro ao salvar lotes:', err)
    }
  }

  // Criar novo lote
  const criarLote = async (dados: LoteFormData): Promise<boolean> => {
    try {
      const novoLote: Lote = {
        id: Date.now().toString(),
        propriedade: 'Fazenda Santa Maria', // Simulado
        propriedade_id: 'prop-1',
        nome: dados.nome,
        descricao: dados.descricao,
        criterio_agrupamento: dados.criterio_agrupamento,
        area_atual_id: dados.area_atual_id,
        ativo: dados.ativo,
        data_criacao: new Date().toISOString(),
        total_animais: 0,
        total_ua: 0,
        peso_medio: 0,
        gmd_medio: 0
      }

      const novosLotes = [...lotes, novoLote]
      salvarLotes(novosLotes)
      return true
    } catch (err) {
      setError('Erro ao criar lote')
      console.error('Erro ao criar lote:', err)
      return false
    }
  }

  // Atualizar lote
  const atualizarLote = async (id: string, dados: Partial<LoteFormData>): Promise<boolean> => {
    try {
      const novosLotes = lotes.map(lote => 
        lote.id === id ? { ...lote, ...dados } : lote
      )
      salvarLotes(novosLotes)
      return true
    } catch (err) {
      setError('Erro ao atualizar lote')
      console.error('Erro ao atualizar lote:', err)
      return false
    }
  }

  // Excluir lote
  const excluirLote = async (id: string): Promise<boolean> => {
    try {
      const novosLotes = lotes.filter(lote => lote.id !== id)
      salvarLotes(novosLotes)
      return true
    } catch (err) {
      setError('Erro ao excluir lote')
      console.error('Erro ao excluir lote:', err)
      return false
    }
  }

  // Obter lote por ID
  const obterLote = (id: string): Lote | undefined => {
    return lotes.find(lote => lote.id === id)
  }

  // Obter estatísticas do lote
  const obterEstatisticas = async (id: string): Promise<EstatisticasLote | null> => {
    try {
      const lote = obterLote(id)
      if (!lote) return null

      // Simulando estatísticas
      return {
        basicas: {
          total_animais: lote.total_animais,
          total_ua: lote.total_ua,
          peso_medio: lote.peso_medio,
          gmd_medio: lote.gmd_medio
        },
        distribuicao: {
          por_categoria: [
            { categoria: 'Novilha', total: Math.floor(lote.total_animais * 0.6) },
            { categoria: 'Vaca', total: Math.floor(lote.total_animais * 0.3) },
            { categoria: 'Touro', total: Math.floor(lote.total_animais * 0.1) }
          ],
          por_sexo: [
            { sexo: 'F', total: Math.floor(lote.total_animais * 0.7) },
            { sexo: 'M', total: Math.floor(lote.total_animais * 0.3) }
          ]
        }
      }
    } catch (err) {
      setError('Erro ao obter estatísticas')
      console.error('Erro ao obter estatísticas:', err)
      return null
    }
  }

  // Alternar status do lote
  const alternarStatusLote = async (id: string): Promise<boolean> => {
    try {
      const novosLotes = lotes.map(lote => 
        lote.id === id ? { ...lote, ativo: !lote.ativo } : lote
      )
      salvarLotes(novosLotes)
      return true
    } catch (err) {
      setError('Erro ao alterar status do lote')
      console.error('Erro ao alterar status do lote:', err)
      return false
    }
  }

  // Recarregar lotes
  const recarregarLotes = () => {
    carregarLotes()
  }

  return {
    lotes,
    loading,
    error,
    criarLote,
    atualizarLote,
    excluirLote,
    obterLote,
    obterEstatisticas,
    alternarStatusLote,
    recarregarLotes
  }
}
