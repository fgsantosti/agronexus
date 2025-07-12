// Tipos para os dados dos animais
export interface Animal {
  id: string
  identificacao_unica: string
  nome_registro: string
  sexo: 'M' | 'F'
  data_nascimento: string
  raca: string
  categoria: string
  status: string
  peso_atual?: number
  lote_atual?: string
  gmd?: number
  observacoes?: string
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

// Tipos para categorias de animais
export type CategoriaAnimal = 
  | 'bezerro'
  | 'bezerro_desmamado'
  | 'novilho'
  | 'novilha'
  | 'boi'
  | 'vaca'
  | 'touro'
  | 'reprodutor'

// Tipos para status do animal
export type StatusAnimal = 
  | 'ativo'
  | 'vendido'
  | 'morto'
  | 'descartado'
  | 'emprestado'

// Tipos para raças
export type RacaAnimal = 
  | 'Nelore'
  | 'Angus'
  | 'Brahman'
  | 'Hereford'
  | 'Limousin'
  | 'Charolês'
  | 'Simmental'
  | 'Guzerá'
  | 'Gir'
  | 'Tabapuã'
  | 'Sem Raça Definida'
  | 'Cruzamento'
