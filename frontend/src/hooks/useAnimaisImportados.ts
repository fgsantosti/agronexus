'use client'

import { useState, useEffect } from 'react'

export interface AnimalImportado {
  id: string
  identificacao_unica: string
  nome_registro?: string
  brinco_eletronico?: string
  especie: string
  raca?: string
  sexo: string
  data_nascimento: string
  categoria: string
  peso_atual?: number
  origem: string
  lote_atual: string
  pasto: string
  pai?: string
  mae?: string
  observacoes?: string
  status: string
  data_criacao: string
  importado: boolean
}

export function useAnimaisImportados() {
  const [animais, setAnimais] = useState<AnimalImportado[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar animais do localStorage
  useEffect(() => {
    try {
      const animaisArmazenados = localStorage.getItem('animais_importados')
      if (animaisArmazenados) {
        setAnimais(JSON.parse(animaisArmazenados))
      }
    } catch (error) {
      console.error('Erro ao carregar animais do localStorage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Salvar animais no localStorage
  const salvarAnimais = (novosAnimais: AnimalImportado[]) => {
    try {
      localStorage.setItem('animais_importados', JSON.stringify(novosAnimais))
      setAnimais(novosAnimais)
    } catch (error) {
      console.error('Erro ao salvar animais no localStorage:', error)
    }
  }

  // Adicionar novo animal
  const adicionarAnimal = (animal: Omit<AnimalImportado, 'id' | 'data_criacao'>) => {
    const novoAnimal: AnimalImportado = {
      ...animal,
      id: `animal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data_criacao: new Date().toISOString()
    }
    
    const novosAnimais = [...animais, novoAnimal]
    salvarAnimais(novosAnimais)
    return novoAnimal
  }

  // Atualizar animal
  const atualizarAnimal = (id: string, dadosAtualizados: Partial<AnimalImportado>) => {
    const novosAnimais = animais.map(animal => 
      animal.id === id 
        ? { ...animal, ...dadosAtualizados }
        : animal
    )
    salvarAnimais(novosAnimais)
  }

  // Remover animal
  const removerAnimal = (id: string) => {
    const novosAnimais = animais.filter(animal => animal.id !== id)
    salvarAnimais(novosAnimais)
  }

  // Limpar todos os animais
  const limparAnimais = () => {
    localStorage.removeItem('animais_importados')
    setAnimais([])
  }

  // Buscar animal por ID
  const buscarAnimalPorId = (id: string) => {
    return animais.find(animal => animal.id === id)
  }

  // Buscar animais por critérios
  const buscarAnimais = (filtros: {
    especie?: string
    sexo?: string
    categoria?: string
    lote?: string
    status?: string
  }) => {
    return animais.filter(animal => {
      if (filtros.especie && animal.especie !== filtros.especie) return false
      if (filtros.sexo && animal.sexo !== filtros.sexo) return false
      if (filtros.categoria && animal.categoria !== filtros.categoria) return false
      if (filtros.lote && animal.lote_atual !== filtros.lote) return false
      if (filtros.status && animal.status !== filtros.status) return false
      return true
    })
  }

  // Estatísticas
  const estatisticas = {
    total: animais.length,
    porEspecie: animais.reduce((acc, animal) => {
      acc[animal.especie] = (acc[animal.especie] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    porSexo: animais.reduce((acc, animal) => {
      acc[animal.sexo] = (acc[animal.sexo] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    porCategoria: animais.reduce((acc, animal) => {
      acc[animal.categoria] = (acc[animal.categoria] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    porLote: animais.reduce((acc, animal) => {
      acc[animal.lote_atual] = (acc[animal.lote_atual] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return {
    animais,
    loading,
    adicionarAnimal,
    atualizarAnimal,
    removerAnimal,
    limparAnimais,
    buscarAnimalPorId,
    buscarAnimais,
    estatisticas,
    salvarAnimais
  }
}
