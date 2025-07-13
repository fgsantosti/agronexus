'use client'

import { useState, useCallback, useEffect } from 'react'

export interface MovimentacaoHistorico {
  id: string
  lote_id: string
  tipo: 
    | 'criacao_lote'
    | 'atualizacao_lote'
    | 'adicao_animal'
    | 'remocao_animal'
    | 'movimentacao_animal'
    | 'mudanca_area'
    | 'pesagem'
    | 'vacinacao'
    | 'tratamento'
    | 'reproducao'
    | 'desmame'
    | 'venda'
    | 'morte'
    | 'status_change'
  titulo: string
  descricao: string
  data_hora: string
  usuario?: string
  dados_adicionais?: Record<string, any>
  animais_envolvidos?: string[]
  valor_anterior?: any
  valor_novo?: any
}

export function useHistoricoLoteCompleto() {
  const [historico, setHistorico] = useState<MovimentacaoHistorico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dados simulados de histórico
  const historicoSimulado: MovimentacaoHistorico[] = [
    {
      id: 'hist-1',
      lote_id: 'lote-1',
      tipo: 'criacao_lote',
      titulo: 'Lote Criado',
      descricao: 'Lote "Bezerros 2024" foi criado no sistema',
      data_hora: '2024-01-15T08:30:00',
      usuario: 'João Silva',
      dados_adicionais: {
        criterio: 'Idade e peso',
        capacidade_inicial: 50
      }
    },
    {
      id: 'hist-2',
      lote_id: 'lote-1',
      tipo: 'adicao_animal',
      titulo: 'Animais Adicionados',
      descricao: '15 bezerros foram adicionados ao lote',
      data_hora: '2024-01-15T09:15:00',
      usuario: 'Maria Santos',
      animais_envolvidos: ['animal-1', 'animal-2', 'animal-3'],
      dados_adicionais: {
        quantidade: 15,
        peso_medio: 180
      }
    },
    {
      id: 'hist-3',
      lote_id: 'lote-1',
      tipo: 'pesagem',
      titulo: 'Pesagem Realizada',
      descricao: 'Pesagem mensal dos animais do lote',
      data_hora: '2024-02-15T14:20:00',
      usuario: 'Carlos Oliveira',
      dados_adicionais: {
        peso_medio_anterior: 180,
        peso_medio_atual: 210,
        ganho_total: 450
      }
    },
    {
      id: 'hist-4',
      lote_id: 'lote-1',
      tipo: 'vacinacao',
      titulo: 'Vacinação Aplicada',
      descricao: 'Vacinação contra aftosa aplicada em todos os animais',
      data_hora: '2024-02-20T10:00:00',
      usuario: 'Dr. Pedro Vet',
      dados_adicionais: {
        vacina: 'Aftosa',
        lote_vacina: 'LOTE2024001',
        animais_vacinados: 15
      }
    },
    {
      id: 'hist-5',
      lote_id: 'lote-1',
      tipo: 'mudanca_area',
      titulo: 'Mudança de Área',
      descricao: 'Lote foi movido para pasto 3',
      data_hora: '2024-03-01T07:45:00',
      usuario: 'José Fazendeiro',
      valor_anterior: 'Pasto 1',
      valor_novo: 'Pasto 3',
      dados_adicionais: {
        motivo: 'Rotação de pastagem',
        area_ha: 25
      }
    },
    {
      id: 'hist-6',
      lote_id: 'lote-1',
      tipo: 'tratamento',
      titulo: 'Tratamento Veterinário',
      descricao: 'Tratamento preventivo contra vermes',
      data_hora: '2024-03-10T16:30:00',
      usuario: 'Dr. Ana Veterinária',
      animais_envolvidos: ['animal-1', 'animal-4'],
      dados_adicionais: {
        medicamento: 'Ivermectina',
        dosagem: '1ml/50kg',
        motivo: 'Prevenção parasitas'
      }
    },
    {
      id: 'hist-7',
      lote_id: 'lote-1',
      tipo: 'desmame',
      titulo: 'Desmame Realizado',
      descricao: '8 bezerros foram desmamados',
      data_hora: '2024-03-20T11:15:00',
      usuario: 'Maria Santos',
      animais_envolvidos: ['animal-1', 'animal-2'],
      dados_adicionais: {
        idade_media: 8,
        peso_medio: 220
      }
    },
    {
      id: 'hist-8',
      lote_id: 'lote-1',
      tipo: 'venda',
      titulo: 'Venda de Animais',
      descricao: '3 novilhos foram vendidos',
      data_hora: '2024-04-05T13:20:00',
      usuario: 'João Silva',
      animais_envolvidos: ['animal-3'],
      dados_adicionais: {
        comprador: 'Frigorífico Central',
        peso_total: 1080,
        valor_total: 8640.00,
        preco_kg: 8.00
      }
    }
  ]

  const carregarHistorico = useCallback(async (loteId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const historicoLote = historicoSimulado.filter(h => h.lote_id === loteId)
      setHistorico(historicoLote.sort((a, b) => 
        new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
      ))
    } catch (err) {
      setError('Erro ao carregar histórico')
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const adicionarMovimentacao = async (movimentacao: Omit<MovimentacaoHistorico, 'id' | 'data_hora'>): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const novaMovimentacao: MovimentacaoHistorico = {
        ...movimentacao,
        id: `hist-${Date.now()}`,
        data_hora: new Date().toISOString()
      }
      
      setHistorico(prev => [novaMovimentacao, ...prev])
      return true
    } catch (err) {
      setError('Erro ao adicionar movimentação')
      console.error('Erro ao adicionar movimentação:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const filtrarPorTipo = useCallback((tipos: MovimentacaoHistorico['tipo'][]): MovimentacaoHistorico[] => {
    if (tipos.length === 0) return historico
    return historico.filter(h => tipos.includes(h.tipo))
  }, [historico])

  const filtrarPorPeriodo = useCallback((dataInicio: string, dataFim: string): MovimentacaoHistorico[] => {
    return historico.filter(h => {
      const dataMovimentacao = new Date(h.data_hora)
      return dataMovimentacao >= new Date(dataInicio) && dataMovimentacao <= new Date(dataFim)
    })
  }, [historico])

  const getEstatisticas = useCallback(() => {
    const totalMovimentacoes = historico.length
    const tiposCount = historico.reduce((acc, h) => {
      acc[h.tipo] = (acc[h.tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const ultimaMovimentacao = historico[0]?.data_hora
    const primeiraMovimentacao = historico[historico.length - 1]?.data_hora

    return {
      total: totalMovimentacoes,
      por_tipo: tiposCount,
      ultima_movimentacao: ultimaMovimentacao,
      primeira_movimentacao: primeiraMovimentacao
    }
  }, [historico])

  return {
    historico,
    loading,
    error,
    carregarHistorico,
    adicionarMovimentacao,
    filtrarPorTipo,
    filtrarPorPeriodo,
    getEstatisticas
  }
}
