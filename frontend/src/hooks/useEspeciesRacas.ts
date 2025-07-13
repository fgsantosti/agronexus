import { useState, useEffect } from 'react'
import { EspecieAnimal, RacaAnimal } from '@/types/animal'

export function useEspeciesRacas() {
  const [especies, setEspecies] = useState<EspecieAnimal[]>([])
  const [racas, setRacas] = useState<RacaAnimal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEspeciesRacas = async () => {
      try {
        setLoading(true)
        
        // Buscar espécies
        const especiesResponse = await fetch('/api/especies/')
        if (!especiesResponse.ok) {
          throw new Error('Erro ao buscar espécies')
        }
        const especiesData = await especiesResponse.json()
        setEspecies(especiesData)

        // Buscar raças
        const racasResponse = await fetch('/api/racas/')
        if (!racasResponse.ok) {
          throw new Error('Erro ao buscar raças')
        }
        const racasData = await racasResponse.json()
        setRacas(racasData)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        
        // Dados mock para desenvolvimento
        setEspecies([
          {
            id: '1',
            nome: 'bovino',
            nome_display: 'Bovino',
            peso_ua_referencia: 450,
            periodo_gestacao_dias: 285,
            idade_primeira_cobertura_meses: 24,
            ativo: true
          },
          {
            id: '2',
            nome: 'caprino',
            nome_display: 'Caprino',
            peso_ua_referencia: 45,
            periodo_gestacao_dias: 150,
            idade_primeira_cobertura_meses: 12,
            ativo: true
          },
          {
            id: '3',
            nome: 'ovino',
            nome_display: 'Ovino',
            peso_ua_referencia: 45,
            periodo_gestacao_dias: 150,
            idade_primeira_cobertura_meses: 12,
            ativo: true
          },
          {
            id: '4',
            nome: 'equino',
            nome_display: 'Equino',
            peso_ua_referencia: 500,
            periodo_gestacao_dias: 330,
            idade_primeira_cobertura_meses: 36,
            ativo: true
          },
          {
            id: '5',
            nome: 'suino',
            nome_display: 'Suíno',
            peso_ua_referencia: 150,
            periodo_gestacao_dias: 114,
            idade_primeira_cobertura_meses: 8,
            ativo: true
          }
        ])

        setRacas([
          // Bovino
          { id: '1', especie: 'bovino', nome: 'Nelore', origem: 'Índia', ativo: true },
          { id: '2', especie: 'bovino', nome: 'Angus', origem: 'Escócia', ativo: true },
          { id: '3', especie: 'bovino', nome: 'Brahman', origem: 'Estados Unidos', ativo: true },
          { id: '4', especie: 'bovino', nome: 'Gir', origem: 'Índia', ativo: true },
          { id: '5', especie: 'bovino', nome: 'Guzerá', origem: 'Índia', ativo: true },
          { id: '6', especie: 'bovino', nome: 'Tabapuã', origem: 'Brasil', ativo: true },
          { id: '7', especie: 'bovino', nome: 'Canchim', origem: 'Brasil', ativo: true },
          { id: '8', especie: 'bovino', nome: 'Brangus', origem: 'Estados Unidos', ativo: true },
          { id: '9', especie: 'bovino', nome: 'Senepol', origem: 'Santa Cruz', ativo: true },
          { id: '10', especie: 'bovino', nome: 'Limousin', origem: 'França', ativo: true },
          { id: '11', especie: 'bovino', nome: 'Charolês', origem: 'França', ativo: true },
          { id: '12', especie: 'bovino', nome: 'Simental', origem: 'Suíça', ativo: true },
          { id: '13', especie: 'bovino', nome: 'Hereford', origem: 'Inglaterra', ativo: true },
          
          // Caprino
          { id: '14', especie: 'caprino', nome: 'Boer', origem: 'África do Sul', ativo: true },
          { id: '15', especie: 'caprino', nome: 'Anglo Nubiana', origem: 'África/Ásia', ativo: true },
          { id: '16', especie: 'caprino', nome: 'Saanen', origem: 'Suíça', ativo: true },
          { id: '17', especie: 'caprino', nome: 'Parda Alpina', origem: 'Suíça', ativo: true },
          { id: '18', especie: 'caprino', nome: 'Toggenburg', origem: 'Suíça', ativo: true },
          { id: '19', especie: 'caprino', nome: 'Canindé', origem: 'Brasil', ativo: true },
          { id: '20', especie: 'caprino', nome: 'Moxotó', origem: 'Brasil', ativo: true },
          { id: '21', especie: 'caprino', nome: 'Morada Nova', origem: 'Brasil', ativo: true },
          { id: '22', especie: 'caprino', nome: 'Repartida', origem: 'Brasil', ativo: true },
          { id: '23', especie: 'caprino', nome: 'Azul', origem: 'Brasil', ativo: true },
          { id: '24', especie: 'caprino', nome: 'Marota', origem: 'Brasil', ativo: true },
          
          // Ovino
          { id: '25', especie: 'ovino', nome: 'Dorper', origem: 'África do Sul', ativo: true },
          { id: '26', especie: 'ovino', nome: 'Santa Inês', origem: 'Brasil', ativo: true },
          { id: '27', especie: 'ovino', nome: 'Morada Nova', origem: 'Brasil', ativo: true },
          { id: '28', especie: 'ovino', nome: 'Somalis Brasileira', origem: 'Brasil', ativo: true },
          { id: '29', especie: 'ovino', nome: 'Bergamácia', origem: 'França', ativo: true },
          { id: '30', especie: 'ovino', nome: 'Ile de France', origem: 'França', ativo: true },
          { id: '31', especie: 'ovino', nome: 'Suffolk', origem: 'Inglaterra', ativo: true },
          { id: '32', especie: 'ovino', nome: 'Texel', origem: 'Holanda', ativo: true },
          { id: '33', especie: 'ovino', nome: 'Corriedale', origem: 'Nova Zelândia', ativo: true },
          { id: '34', especie: 'ovino', nome: 'Romney Marsh', origem: 'Inglaterra', ativo: true },
          { id: '35', especie: 'ovino', nome: 'Ideal', origem: 'Uruguai', ativo: true },
          
          // Equino
          { id: '36', especie: 'equino', nome: 'Mangalarga Marchador', origem: 'Brasil', ativo: true },
          { id: '37', especie: 'equino', nome: 'Quarto de Milha', origem: 'Estados Unidos', ativo: true },
          { id: '38', especie: 'equino', nome: 'Crioulo', origem: 'América do Sul', ativo: true },
          { id: '39', especie: 'equino', nome: 'Puro Sangue Inglês', origem: 'Inglaterra', ativo: true },
          { id: '40', especie: 'equino', nome: 'Andaluz', origem: 'Espanha', ativo: true },
          { id: '41', especie: 'equino', nome: 'Árabe', origem: 'Península Arábica', ativo: true },
          
          // Suíno
          { id: '42', especie: 'suino', nome: 'Landrace', origem: 'Dinamarca', ativo: true },
          { id: '43', especie: 'suino', nome: 'Large White', origem: 'Inglaterra', ativo: true },
          { id: '44', especie: 'suino', nome: 'Duroc', origem: 'Estados Unidos', ativo: true },
          { id: '45', especie: 'suino', nome: 'Pietrain', origem: 'Bélgica', ativo: true },
          { id: '46', especie: 'suino', nome: 'Hampshire', origem: 'Inglaterra', ativo: true },
          { id: '47', especie: 'suino', nome: 'Piau', origem: 'Brasil', ativo: true },
          { id: '48', especie: 'suino', nome: 'Caruncho', origem: 'Brasil', ativo: true }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchEspeciesRacas()
  }, [])

  const getRacasPorEspecie = (especieNome: string): RacaAnimal[] => {
    return racas.filter(raca => raca.especie === especieNome && raca.ativo)
  }

  return {
    especies: especies.filter(e => e.ativo),
    racas,
    getRacasPorEspecie,
    loading,
    error
  }
}
