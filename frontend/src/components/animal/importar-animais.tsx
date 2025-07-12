'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
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
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface AnimalImportacao {
  linha: number
  identificacao_unica: string
  nome_registro: string
  sexo: string
  data_nascimento: string
  raca: string
  categoria: string
  peso_atual?: string
  lote_atual: string
  pasto: string
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
  'sexo',
  'data_nascimento',
  'raca',
  'categoria',
  'peso_atual',
  'lote_atual',
  'pasto',
  'observacoes'
]

const RACAS_VALIDAS = [
  'Nelore', 'Angus', 'Brahman', 'Hereford', 'Simmental', 'Charolês', 
  'Limousin', 'Senepol', 'Girolando', 'Guzerat', 'Indubrasil', 'Canchim'
]

const CATEGORIAS_VALIDAS = [
  'Bezerro', 'Bezerra', 'Novilho', 'Novilha', 'Touro', 'Vaca', 'Boi'
]

export function ImportarAnimais() {
  const router = useRouter()
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

  const baixarTemplate = () => {
    const csvContent = [
      TEMPLATE_HEADERS.join(','),
      'BR001,Estrela da Manhã,F,2022-03-15,Nelore,Novilha,380,Lote A,Pasto 1,Animal em boa condição',
      'BR002,Touro Rex,M,2021-01-10,Angus,Touro,750,Reprodutor,Pasto 2,Reprodutor principal'
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
    if (!animal.nome_registro) erros.push('Nome do registro é obrigatório')
    if (!animal.sexo) erros.push('Sexo é obrigatório')
    if (!animal.data_nascimento) erros.push('Data de nascimento é obrigatória')
    if (!animal.raca) erros.push('Raça é obrigatória')
    if (!animal.categoria) erros.push('Categoria é obrigatória')
    if (!animal.lote_atual) erros.push('Lote atual é obrigatório')
    if (!animal.pasto) erros.push('Pasto é obrigatório')
    
    // Validações de formato
    if (animal.sexo && !['M', 'F', 'Macho', 'Fêmea'].includes(animal.sexo)) {
      erros.push('Sexo deve ser M, F, Macho ou Fêmea')
    }
    
    if (animal.raca && !RACAS_VALIDAS.includes(animal.raca)) {
      erros.push(`Raça inválida. Raças válidas: ${RACAS_VALIDAS.join(', ')}`)
    }
    
    if (animal.categoria && !CATEGORIAS_VALIDAS.includes(animal.categoria)) {
      erros.push(`Categoria inválida. Categorias válidas: ${CATEGORIAS_VALIDAS.join(', ')}`)
    }
    
    // Validar data
    if (animal.data_nascimento) {
      const data = new Date(animal.data_nascimento)
      if (isNaN(data.getTime())) {
        erros.push('Data de nascimento inválida (use formato YYYY-MM-DD)')
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
      nome_registro: animal.nome_registro || '',
      sexo: animal.sexo || '',
      data_nascimento: animal.data_nascimento || '',
      raca: animal.raca || '',
      categoria: animal.categoria || '',
      peso_atual: animal.peso_atual || '',
      lote_atual: animal.lote_atual || '',
      pasto: animal.pasto || '',
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
    const headers = linhas[0].split(',').map(h => h.trim())
    
    const animaisProcessados: AnimalImportacao[] = []
    
    for (let i = 1; i < linhas.length; i++) {
      if (linhas[i].trim()) {
        const valores = linhas[i].split(',').map(v => v.trim())
        const animal: any = {}
        
        headers.forEach((header, index) => {
          animal[header] = valores[index] || ''
        })
        
        const animalValidado = validarAnimal(animal, i + 1)
        animaisProcessados.push(animalValidado)
        
        setProgresso((i / (linhas.length - 1)) * 100)
        
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 10))
      }
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
      setArquivo(file)
      processarArquivo(file)
    }
  }

  const confirmarImportacao = async () => {
    setEtapa('processamento')
    setProgresso(0)
    
    const animaisValidos = animais.filter(a => a.status === 'valido')
    
    // Simular importação
    for (let i = 0; i < animaisValidos.length; i++) {
      setProgresso(((i + 1) / animaisValidos.length) * 100)
      await new Promise(resolve => setTimeout(resolve, 100))
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
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button onClick={baixarTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Baixe o template para ver o formato correto
                </span>
              </div>

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground">
                    Suporte para arquivos CSV (máximo 1000 animais)
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
                        <TableHead>Sexo</TableHead>
                        <TableHead>Raça</TableHead>
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
                          <TableCell>{animal.sexo}</TableCell>
                          <TableCell>{animal.raca}</TableCell>
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
