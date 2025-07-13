export interface Lote {
  id: string
  propriedade: string
  propriedade_id: string
  nome: string
  descricao?: string
  criterio_agrupamento: string
  area_atual?: Area
  area_atual_id?: string
  aptidao?: 'corte' | 'leite' | 'dupla_aptidao'
  finalidade?: 'cria' | 'recria' | 'engorda'
  sistema_criacao?: 'intensivo' | 'extensivo' | 'semi_extensivo'
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  total_animais: number
  total_ua: number
  peso_medio?: number
  gmd_medio?: number
  estatisticas?: EstatisticasLote
}

export interface Area {
  id: string
  nome: string
  tipo: 'piquete' | 'curral' | 'baia' | 'campo' | 'pastagem'
  tamanho_ha: number
  status: 'disponivel' | 'em_uso' | 'manutencao'
}

export interface LoteResumo {
  id: string
  nome: string
  total_animais: number
  ativo: boolean
}

export interface EstatisticasLote {
  basicas: {
    total_animais: number
    total_ua: number
    peso_medio?: number
    gmd_medio?: number
  }
  distribuicao: {
    por_categoria: Array<{
      categoria: string
      total: number
    }>
    por_sexo: Array<{
      sexo: string
      total: number
    }>
  }
}

export interface LoteFormData {
  nome: string
  descricao?: string
  criterio_agrupamento: string
  area_atual_id?: string
  aptidao?: 'corte' | 'leite' | 'dupla_aptidao'
  finalidade?: 'cria' | 'recria' | 'engorda'
  sistema_criacao?: 'intensivo' | 'extensivo' | 'semi_extensivo'
  ativo: boolean
}
