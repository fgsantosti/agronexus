// Tipos para espécies de animais
export interface EspecieAnimal {
  id: string
  nome: string
  nome_display: string
  peso_ua_referencia: number
  periodo_gestacao_dias: number
  idade_primeira_cobertura_meses: number
  ativo: boolean
}

// Tipos para raças de animais
export interface RacaAnimal {
  id: string
  especie: string
  nome: string
  origem?: string
  caracteristicas?: string
  peso_medio_adulto_kg?: number
  ativo: boolean
}

// Tipos para os dados dos animais
export interface Animal {
  id: string
  identificacao_unica: string
  nome_registro: string
  sexo: 'M' | 'F'
  data_nascimento: string
  especie: string | EspecieAnimal
  raca?: string | RacaAnimal
  categoria: string
  status: string
  peso_atual?: number
  lote_atual?: string
  gmd?: number
  observacoes?: string
  pai?: string
  mae?: string
  origem?: string
  data_compra?: string
  valor_compra?: number
  data_venda?: string
  valor_venda?: number
  destino?: string
}

// Tipos para estatísticas do rebanho
export interface RebanhoStats {
  total_animais: number
  lotes_com_animais: number
  peso_medio: number
  peso_total: number
}

// Tipos para filtros
export interface FiltrosAnimal {
  categoria: string
  sexo: string
  status: string
  lote: string
}

// Tipos para exportação
export interface ExportOptions {
  filename?: string
  title?: string
  includeStats?: boolean
}

// Tipos para importação
export interface ImportData {
  sucessos: number
  erros: string[]
  animais_criados: Animal[]
}

// Tipos para categorias de animais por espécie
export interface CategoriasPorEspecie {
  bovino: CategoriaBovinoAnimal[]
  caprino: CategoriaCaprinoAnimal[]
  ovino: CategoriaOvinoAnimal[]
  equino: CategoriaEquinoAnimal[]
  suino: CategoriaSuinoAnimal[]
}

export type CategoriaBovinoAnimal = 
  | 'bezerro'
  | 'bezerra'
  | 'novilho'
  | 'novilha'
  | 'touro'
  | 'vaca'

export type CategoriaCaprinoAnimal = 
  | 'cabrito'
  | 'cabrita'
  | 'bode_jovem'
  | 'cabra_jovem'
  | 'bode'
  | 'cabra'

export type CategoriaOvinoAnimal = 
  | 'cordeiro'
  | 'cordeira'
  | 'carneiro_jovem'
  | 'ovelha_jovem'
  | 'carneiro'
  | 'ovelha'

export type CategoriaEquinoAnimal = 
  | 'potro'
  | 'potra'
  | 'garanhao_jovem'
  | 'egua_jovem'
  | 'garanhao'
  | 'egua'

export type CategoriaSuinoAnimal = 
  | 'leitao'
  | 'leitoa'
  | 'cachaço_jovem'
  | 'porca_jovem'
  | 'cachaço'
  | 'porca'

// Tipo genérico para categorias
export type CategoriaAnimal = 
  | CategoriaBovinoAnimal
  | CategoriaCaprinoAnimal
  | CategoriaOvinoAnimal
  | CategoriaEquinoAnimal
  | CategoriaSuinoAnimal

// Tipos para status do animal
export type StatusAnimal = 
  | 'ativo'
  | 'vendido'
  | 'morto'
  | 'descartado'

// Tipos para mapeamento de categorias por espécie
export const CATEGORIAS_POR_ESPECIE = {
  bovino: [
    { value: 'bezerro', label: 'Bezerro' },
    { value: 'bezerra', label: 'Bezerra' },
    { value: 'novilho', label: 'Novilho' },
    { value: 'novilha', label: 'Novilha' },
    { value: 'touro', label: 'Touro' },
    { value: 'vaca', label: 'Vaca' }
  ],
  caprino: [
    { value: 'cabrito', label: 'Cabrito' },
    { value: 'cabrita', label: 'Cabrita' },
    { value: 'bode_jovem', label: 'Bode Jovem' },
    { value: 'cabra_jovem', label: 'Cabra Jovem' },
    { value: 'bode', label: 'Bode' },
    { value: 'cabra', label: 'Cabra' }
  ],
  ovino: [
    { value: 'cordeiro', label: 'Cordeiro' },
    { value: 'cordeira', label: 'Cordeira' },
    { value: 'carneiro_jovem', label: 'Carneiro Jovem' },
    { value: 'ovelha_jovem', label: 'Ovelha Jovem' },
    { value: 'carneiro', label: 'Carneiro' },
    { value: 'ovelha', label: 'Ovelha' }
  ],
  equino: [
    { value: 'potro', label: 'Potro' },
    { value: 'potra', label: 'Potra' },
    { value: 'garanhao_jovem', label: 'Garanhão Jovem' },
    { value: 'egua_jovem', label: 'Égua Jovem' },
    { value: 'garanhao', label: 'Garanhão' },
    { value: 'egua', label: 'Égua' }
  ],
  suino: [
    { value: 'leitao', label: 'Leitão' },
    { value: 'leitoa', label: 'Leitoa' },
    { value: 'cachaço_jovem', label: 'Cachaço Jovem' },
    { value: 'porca_jovem', label: 'Porca Jovem' },
    { value: 'cachaço', label: 'Cachaço' },
    { value: 'porca', label: 'Porca' }
  ]
} as const
