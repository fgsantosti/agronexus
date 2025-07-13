'use client'

import { useState, useEffect, useCallback } from 'react'
import { Animal } from '@/types/animal'

export function useAnimais() {
  const [animais, setAnimais] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulando dados de animais para desenvolvimento
  const animaisSimulados: Animal[] = [
    {
      id: 'animal-1',
      identificacao_unica: 'BR001',
      nome_registro: 'Estrela',
      sexo: 'F',
      data_nascimento: '2022-03-15',
      especie: 'Bovino',
      raca: 'Nelore',
      categoria: 'Vaca',
      status: 'ativo',
      peso_atual: 450,
      lote_atual: 'lote-1',
      gmd: 0.8,
      observacoes: 'Animal saudável'
    },
    {
      id: 'animal-2',
      identificacao_unica: 'BR002',
      nome_registro: 'Thunder',
      sexo: 'M',
      data_nascimento: '2021-08-20',
      especie: 'Bovino',
      raca: 'Angus',
      categoria: 'Touro',
      status: 'ativo',
      peso_atual: 650,
      lote_atual: 'lote-1',
      gmd: 1.2,
      observacoes: 'Reprodutor'
    },
    {
      id: 'animal-3',
      identificacao_unica: 'BR003',
      nome_registro: 'Bella',
      sexo: 'F',
      data_nascimento: '2023-01-10',
      especie: 'Bovino',
      raca: 'Nelore',
      categoria: 'Novilha',
      status: 'ativo',
      peso_atual: 280,
      lote_atual: 'lote-1',
      gmd: 0.9
    },
    {
      id: 'animal-4',
      identificacao_unica: 'BR004',
      nome_registro: 'Spike',
      sexo: 'M',
      data_nascimento: '2023-05-22',
      especie: 'Bovino',
      raca: 'Brahman',
      categoria: 'Bezerro',
      status: 'ativo',
      peso_atual: 180,
      lote_atual: 'lote-2',
      gmd: 1.1
    },
    {
      id: 'animal-5',
      identificacao_unica: 'BR005',
      nome_registro: 'Luna',
      sexo: 'F',
      data_nascimento: '2022-11-30',
      especie: 'Bovino',
      raca: 'Gir',
      categoria: 'Novilha',
      status: 'ativo',
      peso_atual: 320,
      lote_atual: 'lote-2',
      gmd: 0.7
    },
    // Animais sem lote (externos)
    {
      id: 'animal-6',
      identificacao_unica: 'BR006',
      nome_registro: 'Tornado',
      sexo: 'M',
      data_nascimento: '2022-06-15',
      especie: 'Bovino',
      raca: 'Brahman',
      categoria: 'Novilho',
      status: 'ativo',
      peso_atual: 380,
      lote_atual: undefined,
      gmd: 1.0,
      observacoes: 'Pronto para ser alocado em lote'
    },
    {
      id: 'animal-7',
      identificacao_unica: 'BR007',
      nome_registro: 'Princesa',
      sexo: 'F',
      data_nascimento: '2023-02-20',
      especie: 'Bovino',
      raca: 'Nelore',
      categoria: 'Novilha',
      status: 'ativo',
      peso_atual: 250,
      lote_atual: undefined,
      gmd: 0.8,
      observacoes: 'Recém chegada da fazenda vizinha'
    },
    {
      id: 'animal-8',
      identificacao_unica: 'BR008',
      nome_registro: 'Gigante',
      sexo: 'M',
      data_nascimento: '2021-09-10',
      especie: 'Bovino',
      raca: 'Angus',
      categoria: 'Touro',
      status: 'ativo',
      peso_atual: 720,
      lote_atual: undefined,
      gmd: 0.5,
      observacoes: 'Reprodutor em quarentena'
    },
    {
      id: 'animal-9',
      identificacao_unica: 'BR009',
      nome_registro: 'Serena',
      sexo: 'F',
      data_nascimento: '2023-04-05',
      especie: 'Bovino',
      raca: 'Gir',
      categoria: 'Bezerra',
      status: 'ativo',
      peso_atual: 150,
      lote_atual: undefined,
      gmd: 1.2,
      observacoes: 'Desmamada recentemente'
    },
    {
      id: 'animal-10',
      identificacao_unica: 'BR010',
      nome_registro: 'Relâmpago',
      sexo: 'M',
      data_nascimento: '2022-12-01',
      especie: 'Bovino',
      raca: 'Nelore',
      categoria: 'Bezerro',
      status: 'ativo',
      peso_atual: 200,
      lote_atual: undefined,
      gmd: 1.1,
      observacoes: 'Animal jovem para engorda'
    }
  ]

  const carregarAnimais = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setAnimais(animaisSimulados)
    } catch (err) {
      setError('Erro ao carregar animais')
      console.error('Erro ao carregar animais:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getAnimaisByLote = useCallback((loteId: string): Animal[] => {
    return animais.filter(animal => animal.lote_atual === loteId)
  }, [animais])

  const getAnimalById = useCallback((animalId: string): Animal | undefined => {
    return animais.find(animal => animal.id === animalId)
  }, [animais])

  const getAnimaisExternos = useCallback((): Animal[] => {
    return animais.filter(animal => !animal.lote_atual)
  }, [animais])

  const criarAnimal = async (dadosAnimal: Omit<Animal, 'id'>): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const novoAnimal: Animal = {
        ...dadosAnimal,
        id: `animal-${Date.now()}`
      }
      
      setAnimais(prev => [...prev, novoAnimal])
      return true
    } catch (err) {
      setError('Erro ao criar animal')
      console.error('Erro ao criar animal:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const atualizarAnimal = async (animalId: string, dadosAtualizados: Partial<Animal>): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setAnimais(prev => prev.map(animal => 
        animal.id === animalId 
          ? { ...animal, ...dadosAtualizados }
          : animal
      ))
      return true
    } catch (err) {
      setError('Erro ao atualizar animal')
      console.error('Erro ao atualizar animal:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const excluirAnimal = async (animalId: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setAnimais(prev => prev.filter(animal => animal.id !== animalId))
      return true
    } catch (err) {
      setError('Erro ao excluir animal')
      console.error('Erro ao excluir animal:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const moverAnimalParaLote = async (animalId: string, novoLoteId: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setAnimais(prev => prev.map(animal => 
        animal.id === animalId 
          ? { ...animal, lote_atual: novoLoteId }
          : animal
      ))
      return true
    } catch (err) {
      setError('Erro ao mover animal')
      console.error('Erro ao mover animal:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const removerAnimalDoLote = async (animalId: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simulando chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setAnimais(prev => prev.map(animal => 
        animal.id === animalId 
          ? { ...animal, lote_atual: undefined }
          : animal
      ))
      return true
    } catch (err) {
      setError('Erro ao remover animal do lote')
      console.error('Erro ao remover animal do lote:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAnimais()
  }, [carregarAnimais])

  return {
    animais,
    loading,
    error,
    carregarAnimais,
    getAnimaisByLote,
    getAnimalById,
    getAnimaisExternos,
    criarAnimal,
    atualizarAnimal,
    excluirAnimal,
    moverAnimalParaLote,
    removerAnimalDoLote
  }
}
