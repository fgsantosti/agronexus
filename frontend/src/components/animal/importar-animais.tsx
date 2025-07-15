'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FullscreenDialog, FullscreenDialogContent, FullscreenDialogDescription, FullscreenDialogHeader, FullscreenDialogTitle, FullscreenDialogTrigger, FullscreenDialogBody } from "@/components/ui/fullscreen-dialog"
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Eye,
  Trash2,
  RefreshCw,
  Info,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/libs/utils'
import { useRouter } from 'next/navigation'
import { useAnimaisImportados } from '@/hooks/useAnimaisImportados'

interface AnimalImportacao {
  linha: number
  identificacao_unica: string
  nome_registro?: string
  brinco_eletronico?: string
  especie: string
  raca: string
  sexo: string
  data_nascimento: string
  categoria: string
  peso_atual?: string
  origem: string
  lote_atual: string
  pasto: string
  pai?: string
  mae?: string
  observacoes?: string
  status: 'valido' | 'erro' | 'aviso'
  erros: string[]
}

interface ResultadoImportacao {
  total: number
  validos: number
  erros: number
  avisos: number
}

const TEMPLATE_HEADERS = [
  'identificacao_unica',
  'nome_registro', 
  'brinco_eletronico',
  'especie',
  'raca',
  'sexo',
  'data_nascimento',
  'categoria',
  'peso_atual',
  'origem',
  'lote_atual',
  'pasto',
  'pai',
  'mae',
  'observacoes'
]

// Espécies e suas respectivas raças e categorias
const ESPECIES_RACAS_CATEGORIAS = {
  bovino: {
    nome_display: 'Bovino',
    racas: ['Nelore', 'Angus', 'Brahman', 'Hereford', 'Simmental', 'Charolês', 'Limousin', 'Senepol', 'Girolando', 'Guzerat', 'Indubrasil', 'Canchim'],
    categorias: [
      { codigo: 'bezerro', nome: 'Bezerro' },
      { codigo: 'bezerra', nome: 'Bezerra' },
      { codigo: 'novilho', nome: 'Novilho' },
      { codigo: 'novilha', nome: 'Novilha' },
      { codigo: 'touro', nome: 'Touro' },
      { codigo: 'vaca', nome: 'Vaca' }
    ]
  },
  caprino: {
    nome_display: 'Caprino',
    racas: ['Boer', 'Anglo Nubiana', 'Saanen', 'Toggenburg', 'Parda Alpina', 'Canindé', 'Moxotó', 'Repartida'],
    categorias: [
      { codigo: 'cabrito', nome: 'Cabrito' },
      { codigo: 'cabrita', nome: 'Cabrita' },
      { codigo: 'bode_jovem', nome: 'Bode Jovem' },
      { codigo: 'cabra_jovem', nome: 'Cabra Jovem' },
      { codigo: 'bode', nome: 'Bode' },
      { codigo: 'cabra', nome: 'Cabra' }
    ]
  },
  ovino: {
    nome_display: 'Ovino',
    racas: ['Santa Inês', 'Dorper', 'Morada Nova', 'Katahdin', 'Somalis Brasileira', 'Cariri', 'Rabo Largo'],
    categorias: [
      { codigo: 'cordeiro', nome: 'Cordeiro' },
      { codigo: 'cordeira', nome: 'Cordeira' },
      { codigo: 'carneiro_jovem', nome: 'Carneiro Jovem' },
      { codigo: 'ovelha_jovem', nome: 'Ovelha Jovem' },
      { codigo: 'carneiro', nome: 'Carneiro' },
      { codigo: 'ovelha', nome: 'Ovelha' }
    ]
  },
  equino: {
    nome_display: 'Equino',
    racas: ['Quarto de Milha', 'Mangalarga', 'Crioulo', 'Árabe', 'Campolina', 'Lusitano'],
    categorias: [
      { codigo: 'potro', nome: 'Potro' },
      { codigo: 'potra', nome: 'Potra' },
      { codigo: 'garanhao', nome: 'Garanhão' },
      { codigo: 'egua', nome: 'Égua' }
    ]
  },
  suino: {
    nome_display: 'Suíno',
    racas: ['Landrace', 'Large White', 'Duroc', 'Pietrain', 'Hampshire', 'Piau'],
    categorias: [
      { codigo: 'leitao', nome: 'Leitão' },
      { codigo: 'leitoa', nome: 'Leitoa' },
      { codigo: 'cachaço', nome: 'Cachaço' },
      { codigo: 'porca', nome: 'Porca' }
    ]
  }
}

const ESPECIES_VALIDAS = Object.keys(ESPECIES_RACAS_CATEGORIAS)

export function ImportarAnimais() {
  const router = useRouter()
  const { adicionarAnimal } = useAnimaisImportados()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [etapa, setEtapa] = useState<'upload' | 'validacao' | 'processamento' | 'concluido'>('upload')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [animais, setAnimais] = useState<AnimalImportacao[]>([])
  const [resultado, setResultado] = useState<ResultadoImportacao>({
    total: 0,
    validos: 0,
    erros: 0,
    avisos: 0
  })
  const [progresso, setProgresso] = useState(0)
  const [processando, setProcessando] = useState(false)
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [showPreview, setShowPreview] = useState(false)

  const baixarTemplate = () => {
    const csvContent = [
      // Cabeçalho
      TEMPLATE_HEADERS.join(','),
      // Bovinos
      'BOV001,Estrela da Manhã,982000123456789,bovino,Nelore,F,2022-03-15,novilha,380,proprio,Lote Novilhas,Pasto 1,,,Animal de boa genética',
      'BOV002,Touro Supremo,982000123456790,bovino,Angus,M,2020-01-10,touro,850,compra,Reprodutores,Pasto Central,,,Reprodutor principal da fazenda',
      'BOV003,Bezerra Bella,982000123456791,bovino,Brahman,F,2024-05-20,bezerra,120,proprio,Lote Bezerras,Pasto 3,BOV002,BOV001,Filha de Touro Supremo',
      'BOV004,Novilho Forte,982000123456792,bovino,Canchim,M,2023-08-12,novilho,450,leilao,Lote Engorda,Pasto 2,,,Adquirido em leilão',
      // Caprinos
      'CAP001,Cabrita Luna,982000123456793,caprino,Boer,F,2023-01-15,cabrita,45,doacao,Lote Cabras,Pasto 4,,,Cabrita de alta produção',
      'CAP002,Bode Alpha,982000123456794,caprino,Anglo Nubiana,M,2022-03-08,bode,75,compra,Reprodutores Caprinos,Pasto 5,,,Reprodutor de elite',
      'CAP003,Cabrito Veloz,982000123456795,caprino,Saanen,M,2024-06-10,cabrito,25,proprio,Lote Cabritos,Pasto 4,CAP002,CAP001,Filho de Alpha e Luna',
      // Ovinos
      'OVI001,Ovelha Mansa,982000123456796,ovino,Santa Inês,F,2022-09-20,ovelha,55,parceria,Lote Ovelhas,Pasto 6,,,Matriz produtiva',
      'OVI002,Carneiro Líder,982000123456797,ovino,Dorper,M,2021-12-05,carneiro,80,leilao,Reprodutores Ovinos,Pasto 7,,,Reprodutor de leilão',
      'OVI003,Cordeira Doce,982000123456798,ovino,Morada Nova,F,2024-03-18,cordeira,30,proprio,Lote Cordeiros,Pasto 6,OVI002,OVI001,Primeira cria da estação',
      // Equinos
      'EQU001,Égua Veloz,982000123456799,equino,Quarto de Milha,F,2019-07-14,egua,480,compra,Cavalos Trabalho,Piquete A,,,Égua de trabalho',
      'EQU002,Garanhão Real,982000123456800,equino,Mangalarga,M,2018-04-22,garanhao,520,leilao,Reprodutores Equinos,Piquete B,,,Garanhão de leilão',
      'EQU003,Potra Estrela,982000123456801,equino,Crioulo,F,2023-11-30,potra,320,proprio,Potros Jovens,Piquete C,EQU002,EQU001,Potencial para competição',
      // Suínos
      'SUI001,Porca Mãe,982000123456802,suino,Landrace,F,2022-02-28,porca,180,compra,Maternidade,Baia 1,,,Matriz de alta prolificidade',
      'SUI002,Cachaço Forte,982000123456803,suino,Duroc,M,2021-06-15,cachaço,220,leilao,Reprodutores Suínos,Baia 2,,,Reprodutor de leilão',
      'SUI003,Leitão Rápido,982000123456804,suino,Large White,M,2024-04-08,leitao,35,proprio,Lote Crescimento,Baia 3,SUI002,SUI001,Leitão de crescimento rápido'
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template-importacao-animais.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const validarAnimal = (animal: any, linha: number): AnimalImportacao => {
    const erros: string[] = []
    
    // Validações obrigatórias
    if (!animal.identificacao_unica) erros.push('Identificação única é obrigatória')
    if (!animal.especie) erros.push('Espécie é obrigatória')
    if (!animal.sexo) erros.push('Sexo é obrigatório')
    if (!animal.data_nascimento) erros.push('Data de nascimento é obrigatória')
    if (!animal.categoria) erros.push('Categoria é obrigatória')
    if (!animal.origem) erros.push('Origem é obrigatória')
    if (!animal.lote_atual) erros.push('Lote atual é obrigatório')
    if (!animal.pasto) erros.push('Pasto é obrigatório')
    
    // Validações de formato
    if (animal.sexo && !['M', 'F', 'Macho', 'Fêmea'].includes(animal.sexo)) {
      erros.push('Sexo deve ser M, F, Macho ou Fêmea')
    }
    
    // Validar origem
    if (animal.origem && !['proprio', 'compra', 'leilao', 'doacao', 'parceria'].includes(animal.origem)) {
      erros.push('Origem deve ser: proprio, compra, leilao, doacao ou parceria')
    }
    
    // Validar brinco eletrônico (somente números se fornecido)
    if (animal.brinco_eletronico && !/^\d+$/.test(animal.brinco_eletronico)) {
      erros.push('Brinco eletrônico deve conter apenas números')
    }
    
    // Validar espécie
    if (animal.especie && !ESPECIES_VALIDAS.includes(animal.especie)) {
      erros.push(`Espécie inválida. Espécies válidas: ${ESPECIES_VALIDAS.join(', ')}`)
    }
    
    // Validar raça por espécie
    if (animal.especie && animal.raca) {
      const especieData = ESPECIES_RACAS_CATEGORIAS[animal.especie as keyof typeof ESPECIES_RACAS_CATEGORIAS]
      if (especieData && !especieData.racas.includes(animal.raca)) {
        erros.push(`Raça "${animal.raca}" não é válida para ${especieData.nome_display}. Raças válidas: ${especieData.racas.join(', ')}`)
      }
    }
    
    // Validar categoria por espécie
    if (animal.especie && animal.categoria) {
      const especieData = ESPECIES_RACAS_CATEGORIAS[animal.especie as keyof typeof ESPECIES_RACAS_CATEGORIAS]
      if (especieData) {
        const categoriaValida = especieData.categorias.some(cat => 
          cat.codigo === animal.categoria || cat.nome === animal.categoria
        )
        if (!categoriaValida) {
          const categoriasDisponiveis = especieData.categorias.map(cat => `${cat.nome} (${cat.codigo})`).join(', ')
          erros.push(`Categoria "${animal.categoria}" não é válida para ${especieData.nome_display}. Categorias válidas: ${categoriasDisponiveis}`)
        }
      }
    }
    
    // Validar data
    if (animal.data_nascimento) {
      const data = new Date(animal.data_nascimento)
      if (isNaN(data.getTime())) {
        erros.push('Data de nascimento inválida (use formato YYYY-MM-DD)')
      } else if (data > new Date()) {
        erros.push('Data de nascimento não pode ser futura')
      }
    }
    
    // Validar peso
    if (animal.peso_atual && isNaN(Number(animal.peso_atual))) {
      erros.push('Peso atual deve ser um número')
    }
    
    const status = erros.length > 0 ? 'erro' : 'valido'
    
    return {
      linha,
      identificacao_unica: animal.identificacao_unica || '',
      nome_registro: animal.nome_registro || undefined,
      brinco_eletronico: animal.brinco_eletronico || undefined,
      especie: animal.especie || '',
      raca: animal.raca || '',
      sexo: animal.sexo || '',
      data_nascimento: animal.data_nascimento || '',
      categoria: animal.categoria || '',
      peso_atual: animal.peso_atual || '',
      origem: animal.origem || '',
      lote_atual: animal.lote_atual || '',
      pasto: animal.pasto || '',
      pai: animal.pai || '',
      mae: animal.mae || '',
      observacoes: animal.observacoes || '',
      status,
      erros
    }
  }

  const processarArquivo = async (arquivo: File) => {
    setProcessando(true)
    setProgresso(0)
    
    const text = await arquivo.text()
    const linhas = text.split('\n')
    
    // Primeira linha é o cabeçalho
    const headers = linhas[0].split(',').map(h => h.trim())
    const animaisProcessados: AnimalImportacao[] = []
    
    // Processar linhas de dados (excluindo cabeçalho e linhas vazias)
    const linhasDados = linhas.slice(1).filter(linha => linha.trim())
    
    for (let i = 0; i < linhasDados.length; i++) {
      const valores = linhasDados[i].split(',').map(v => v.trim())
      const animal: any = {}
      
      headers.forEach((header, index) => {
        animal[header] = valores[index] || ''
      })
      
      const animalValidado = validarAnimal(animal, i + 2) // +2 para ajustar numeração (linha 1 = cabeçalho)
      animaisProcessados.push(animalValidado)
      
      setProgresso(((i + 1) / linhasDados.length) * 100)
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    setAnimais(animaisProcessados)
    
    const resultado = {
      total: animaisProcessados.length,
      validos: animaisProcessados.filter(a => a.status === 'valido').length,
      erros: animaisProcessados.filter(a => a.status === 'erro').length,
      avisos: animaisProcessados.filter(a => a.status === 'aviso').length
    }
    
    setResultado(resultado)
    setProcessando(false)
    setEtapa('validacao')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande! O tamanho máximo é 5MB.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Validar tipo do arquivo
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Formato de arquivo inválido! Apenas arquivos CSV são aceitos.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      setArquivo(file)
      
      // Ler arquivo para preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const linhas = text.split('\n')
        
        // Validar se tem dados suficientes
        const linhasComDados = linhas.filter(linha => linha.trim())
        if (linhasComDados.length < 2) {
          alert('Arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados.')
          setArquivo(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }

        // Primeira linha é o cabeçalho
        const headers = linhas[0].split(',')
        const dadosPreview = linhas
          .slice(1)
          .filter(linha => linha.trim())
          .slice(0, 5) // Mostrar apenas 5 linhas
          .map(linha => linha.split(','))
        
        setPreviewData([headers, ...dadosPreview])
        setShowPreview(true)
      }
      
      reader.onerror = () => {
        alert('Erro ao ler o arquivo. Tente novamente.')
        setArquivo(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      
      reader.readAsText(file)
    }
  }

  const confirmarProcessamento = () => {
    setShowPreview(false)
    if (arquivo) {
      processarArquivo(arquivo)
    }
  }

  const confirmarImportacao = async () => {
    setEtapa('processamento')
    setProgresso(0)
    
    const animaisValidos = animais.filter(a => a.status === 'valido')
    
    // Importar usando o hook
    for (let i = 0; i < animaisValidos.length; i++) {
      const animal = animaisValidos[i]
      
      // Adicionar animal usando o hook
      adicionarAnimal({
        identificacao_unica: animal.identificacao_unica,
        nome_registro: animal.nome_registro || '',
        especie: animal.especie,
        raca: animal.raca,
        sexo: animal.sexo,
        data_nascimento: animal.data_nascimento,
        categoria: animal.categoria,
        peso_atual: animal.peso_atual ? parseFloat(animal.peso_atual) : undefined,
        origem: animal.origem,
        lote_atual: animal.lote_atual,
        pasto: animal.pasto,
        pai: animal.pai,
        mae: animal.mae,
        observacoes: animal.observacoes,
        status: 'ativo',
        importado: true
      })
      
      setProgresso(((i + 1) / animaisValidos.length) * 100)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    setEtapa('concluido')
  }

  const reiniciar = () => {
    setEtapa('upload')
    setArquivo(null)
    setAnimais([])
    setResultado({ total: 0, validos: 0, erros: 0, avisos: 0 })
    setProgresso(0)
    setProcessando(false)
    setPreviewData([])
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removerAnimal = (linha: number) => {
    setAnimais(prev => prev.filter(a => a.linha !== linha))
    
    const novosAnimais = animais.filter(a => a.linha !== linha)
    const novoResultado = {
      total: novosAnimais.length,
      validos: novosAnimais.filter(a => a.status === 'valido').length,
      erros: novosAnimais.filter(a => a.status === 'erro').length,
      avisos: novosAnimais.filter(a => a.status === 'aviso').length
    }
    setResultado(novoResultado)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valido': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'erro': return <XCircle className="w-4 h-4 text-red-500" />
      case 'aviso': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valido': return 'bg-green-100 text-green-800'
      case 'erro': return 'bg-red-100 text-red-800'
      case 'aviso': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full">
      <div className="max-w-6xl w-full mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Importar Animais</h1>
            <p className="text-muted-foreground">
              Importe animais em lote através de planilha CSV
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/rebanho')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Etapas */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            {[
              { id: 1, label: 'Upload', key: 'upload' },
              { id: 2, label: 'Validação', key: 'validacao' },
              { id: 3, label: 'Processamento', key: 'processamento' },
              { id: 4, label: 'Concluído', key: 'concluido' }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                    etapa === step.key || (step.key === 'upload' && etapa !== 'upload')
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {(etapa === 'validacao' && step.key === 'upload') ||
                   (etapa === 'processamento' && ['upload', 'validacao'].includes(step.key)) ||
                   (etapa === 'concluido' && ['upload', 'validacao', 'processamento'].includes(step.key)) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      (etapa === 'validacao' && step.key === 'upload') ||
                      (etapa === 'processamento' && ['upload', 'validacao'].includes(step.key)) ||
                      (etapa === 'concluido' && ['upload', 'validacao', 'processamento'].includes(step.key))
                        ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo da etapa atual */}
        {etapa === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload do Arquivo</CardTitle>
              <CardDescription>
                Selecione um arquivo CSV com os dados dos animais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ações principais */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button onClick={baixarTemplate} variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
                
                <FullscreenDialog>
                  <FullscreenDialogTrigger asChild>
                    <Button variant="outline" size="lg">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Ver Guia de Importação
                    </Button>
                  </FullscreenDialogTrigger>
                  <FullscreenDialogContent>
                    <FullscreenDialogHeader>
                      <FullscreenDialogTitle>Guia de Importação de Animais</FullscreenDialogTitle>
                      <FullscreenDialogDescription>
                        Informações detalhadas sobre como preparar seu arquivo CSV para importação
                      </FullscreenDialogDescription>
                    </FullscreenDialogHeader>
                    
                    <FullscreenDialogBody>
                      <div className="max-w-7xl mx-auto p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                          {/* Colunas do Template */}
                          <div className="space-y-6">
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                                <FileSpreadsheet className="w-5 h-5" />
                                Colunas Obrigatórias
                              </h3>
                              <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">identificacao_unica:</strong>
                                  <p className="text-gray-600 mt-1">Código único do animal (ex: BOV001, CAP002)</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">especie:</strong>
                                  <p className="text-gray-600 mt-1">bovino, caprino, ovino, equino, suino</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">sexo:</strong>
                                  <p className="text-gray-600 mt-1">M (Macho) ou F (Fêmea)</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">data_nascimento:</strong>
                                  <p className="text-gray-600 mt-1">Formato: YYYY-MM-DD (ex: 2024-01-15)</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">categoria:</strong>
                                  <p className="text-gray-600 mt-1">Varia por espécie (ver categorias ao lado)</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">origem:</strong>
                                  <p className="text-gray-600 mt-1">proprio, compra, leilao, doacao, parceria</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">lote_atual:</strong>
                                  <p className="text-gray-600 mt-1">Nome do lote onde o animal está</p>
                                </div>
                                <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                                  <strong className="text-blue-800">pasto:</strong>
                                  <p className="text-gray-600 mt-1">Nome do pasto/área onde o animal está</p>
                                </div>
                              </div>
                              
                              <h4 className="font-semibold text-blue-900 mt-6 mb-4 text-lg">Colunas Opcionais</h4>
                              <div className="space-y-3 text-sm">
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">nome_registro:</strong>
                                  <span className="text-gray-600 ml-2">Nome do animal (opcional)</span>
                                </div>
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">brinco_eletronico:</strong>
                                  <span className="text-gray-600 ml-2">Número do brinco eletrônico (somente números)</span>
                                </div>
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">raca:</strong>
                                  <span className="text-gray-600 ml-2">Raça do animal</span>
                                </div>
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">peso_atual:</strong>
                                  <span className="text-gray-600 ml-2">Peso em kg (somente números)</span>
                                </div>
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">pai:</strong>
                                  <span className="text-gray-600 ml-2">ID do reprodutor pai</span>
                                </div>
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">mae:</strong>
                                  <span className="text-gray-600 ml-2">ID da matriz mãe</span>
                                </div>
                                <div className="p-3 bg-blue-25 rounded border border-blue-200">
                                  <strong className="text-blue-700">observacoes:</strong>
                                  <span className="text-gray-600 ml-2">Informações adicionais</span>
                                </div>
                              </div>
                            </div>

                            {/* Dicas importantes */}
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                              <h3 className="font-semibold text-green-900 mb-4 text-lg">💡 Dicas Importantes</h3>
                              <div className="space-y-3 text-sm text-green-800">
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Use o template baixado como base</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Primeira linha deve ser o cabeçalho</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Nome do registro é opcional</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Brinco eletrônico deve conter apenas números</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Origem deve ser: proprio, compra, leilao, doacao ou parceria</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Datas devem estar no formato YYYY-MM-DD</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Pesos devem ser números (sem vírgulas)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>IDs de pai/mãe devem existir na planilha</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                  <span>Máximo de 1000 animais por importação</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Categorias por espécie */}
                          <div className="xl:col-span-2">
                            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 h-fit">
                              <h3 className="font-semibold text-amber-900 mb-6 flex items-center gap-2 text-lg">
                                <Badge className="w-5 h-5" />
                                Categorias por Espécie
                              </h3>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {Object.entries(ESPECIES_RACAS_CATEGORIAS).map(([especie, dados]) => (
                                  <div key={especie} className="bg-white p-4 rounded-lg border border-amber-200">
                                    <div className="font-bold text-amber-800 mb-3 text-lg">{dados.nome_display}</div>
                                    
                                    <div className="mb-4">
                                      <h5 className="font-semibold text-amber-700 mb-2">Categorias:</h5>
                                      <div className="grid grid-cols-2 gap-2">
                                        {dados.categorias.map(cat => (
                                          <div key={cat.codigo} className="text-sm bg-amber-50 px-2 py-1 rounded">
                                            <strong>{cat.nome}</strong>
                                            <div className="text-xs text-amber-600">({cat.codigo})</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h5 className="font-semibold text-amber-700 mb-2">Raças disponíveis:</h5>
                                      <div className="text-xs text-amber-600 leading-relaxed">
                                        {dados.racas.join(' • ')}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FullscreenDialogBody>
                  </FullscreenDialogContent>
                </FullscreenDialog>
              </div>

              {/* Area de upload simplificada */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground">
                    Arquivo CSV (máximo 1000 animais e 5MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processando}
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {processando ? 'Processando...' : 'Selecionar Arquivo'}
                </Button>
              </div>

              {processando && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando arquivo...</span>
                    <span>{Math.round(progresso)}%</span>
                  </div>
                  <Progress value={progresso} className="w-full" />
                </div>
              )}

              {/* Preview do arquivo */}
              {showPreview && previewData.length > 0 && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview do Arquivo
                    </CardTitle>
                    <CardDescription>
                      Visualize os primeiros registros antes de processar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto mb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {previewData[0]?.map((header, index) => (
                              <TableHead key={index} className="min-w-[120px]">
                                {header.trim()}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.slice(1).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="text-sm">
                                  {cell.trim() || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowPreview(false)
                          setArquivo(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={confirmarProcessamento}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Processar Arquivo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {etapa === 'validacao' && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    TOTAL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resultado.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    VÁLIDOS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{resultado.validos}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">
                    ERROS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{resultado.erros}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600">
                    AVISOS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{resultado.avisos}</div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas */}
            {resultado.erros > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {resultado.erros} animais têm erros que precisam ser corrigidos antes da importação.
                </AlertDescription>
              </Alert>
            )}

            {/* Tabela de validação */}
            <Card>
              <CardHeader>
                <CardTitle>Validação dos Dados</CardTitle>
                <CardDescription>
                  Revise os dados antes de confirmar a importação
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Linha</TableHead>
                        <TableHead>Identificação</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Espécie</TableHead>
                        <TableHead>Raça</TableHead>
                        <TableHead>Sexo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Erros</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {animais.map((animal) => (
                        <TableRow key={animal.linha}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(animal.status)}
                              <Badge className={getStatusColor(animal.status)}>
                                {animal.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{animal.linha}</TableCell>
                          <TableCell>{animal.identificacao_unica}</TableCell>
                          <TableCell>{animal.nome_registro}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {ESPECIES_RACAS_CATEGORIAS[animal.especie as keyof typeof ESPECIES_RACAS_CATEGORIAS]?.nome_display || animal.especie}
                            </Badge>
                          </TableCell>
                          <TableCell>{animal.raca}</TableCell>
                          <TableCell>{animal.sexo}</TableCell>
                          <TableCell>{animal.categoria}</TableCell>
                          <TableCell>{animal.lote_atual}</TableCell>
                          <TableCell>
                            {animal.erros.length > 0 && (
                              <div className="text-sm text-red-600 max-w-xs">
                                {animal.erros.join(', ')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removerAnimal(animal.linha)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={reiniciar}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
              <Button 
                onClick={confirmarImportacao}
                disabled={resultado.validos === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmar Importação ({resultado.validos} animais)
              </Button>
            </div>
          </div>
        )}

        {etapa === 'processamento' && (
          <Card>
            <CardHeader>
              <CardTitle>Processando Importação</CardTitle>
              <CardDescription>
                Aguarde enquanto os animais são importados para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importando animais...</span>
                  <span>{Math.round(progresso)}%</span>
                </div>
                <Progress value={progresso} className="w-full" />
              </div>
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {etapa === 'concluido' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Importação Concluída
              </CardTitle>
              <CardDescription>
                Os animais foram importados com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  {resultado.validos} animais foram importados com sucesso!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Você pode visualizar os animais importados na lista do rebanho.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={() => router.push('/rebanho')}>
                  Ver Rebanho
                </Button>
                <Button variant="outline" onClick={reiniciar}>
                  Importar Mais Animais
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
