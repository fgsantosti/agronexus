'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, Circle, ArrowLeft, ArrowRight, Save, X } from 'lucide-react'
import { cn } from '@/libs/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEspeciesRacas } from '@/hooks/useEspeciesRacas'
import { CATEGORIAS_POR_ESPECIE } from '@/types/animal'

interface AnimalData {
  // Passo 1: Identificação
  identificacao_unica: string
  nome_registro: string
  brinco_eletronico?: string
  
  // Passo 2: Informações Básicas
  sexo: 'M' | 'F' | ''
  data_nascimento: Date | null
  especie: string
  raca: string
  categoria: string
  
  // Passo 3: Informações Físicas
  peso_nascimento?: number
  peso_atual?: number
  altura?: number
  cor_pelagem: string
  
  // Passo 4: Origem e Genealogia
  origem: string
  pai?: string
  mae?: string
  rgd?: string
  
  // Passo 5: Localização e Manejo
  lote_atual: string
  pasto: string
  data_entrada: Date | null
  status: string
  
  // Passo 6: Observações
  observacoes?: string
  vacinas?: string[]
  exames?: string[]
  restricoes_alimentares?: string
}

const STEPS = [
  {
    id: 1,
    title: 'Identificação',
    description: 'Identifique o animal com brincos e registros'
  },
  {
    id: 2,
    title: 'Informações Básicas',
    description: 'Sexo, data de nascimento, raça e categoria'
  },
  {
    id: 3,
    title: 'Informações Físicas',
    description: 'Peso, altura e características físicas'
  },
  {
    id: 4,
    title: 'Origem e Genealogia',
    description: 'Origem, pais e registros genealógicos'
  },
  {
    id: 5,
    title: 'Localização e Manejo',
    description: 'Lote, pasto e informações de manejo'
  },
  {
    id: 6,
    title: 'Observações',
    description: 'Observações adicionais e histórico médico'
  }
]

const CORES_PELAGEM = [
  'Branco', 'Preto', 'Marrom', 'Vermelho', 'Amarelo', 'Cinza', 'Malhado', 'Zebuíno'
]

export function CadastroAnimal() {
  const router = useRouter()
  const { especies, getRacasPorEspecie, loading } = useEspeciesRacas()
  const [currentStep, setCurrentStep] = useState(1)
  const [animalData, setAnimalData] = useState<AnimalData>({
    identificacao_unica: '',
    nome_registro: '',
    sexo: '',
    data_nascimento: null,
    especie: '',
    raca: '',
    categoria: '',
    cor_pelagem: '',
    origem: '',
    lote_atual: '',
    pasto: '',
    data_entrada: null,
    status: 'ativo'
  })

  const updateAnimalData = (field: keyof AnimalData, value: any) => {
    setAnimalData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Se mudou a espécie, limpa raça e categoria
      if (field === 'especie') {
        newData.raca = ''
        newData.categoria = ''
      }
      
      return newData
    })
  }

  // Função para obter categorias da espécie selecionada
  const getCategoriasPorEspecie = () => {
    if (!animalData.especie) return []
    return CATEGORIAS_POR_ESPECIE[animalData.especie as keyof typeof CATEGORIAS_POR_ESPECIE] || []
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(animalData.identificacao_unica)
      case 2:
        return !!(animalData.sexo && animalData.data_nascimento && animalData.especie && animalData.raca && animalData.categoria)
      case 3:
        return !!(animalData.cor_pelagem)
      case 4:
        return !!(animalData.origem)
      case 5:
        return !!(animalData.lote_atual && animalData.pasto && animalData.data_entrada)
      case 6:
        return true // Último passo sempre válido
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Preparar dados para envio
      const formData = {
        ...animalData,
        // Garantir que as datas estão no formato correto
        data_nascimento: animalData.data_nascimento?.toISOString().split('T')[0],
        data_entrada: animalData.data_entrada?.toISOString().split('T')[0],
        // Converter IDs para objetos se necessário
        especie: animalData.especie,
        raca: animalData.raca
      }

      console.log('Dados do animal:', formData)
      
      // Aqui você implementaria a chamada para a API
      const response = await fetch('/api/animais/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erro ao cadastrar animal')
      }

      alert('Animal cadastrado com sucesso!')
      router.push('/rebanho')
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error)
      alert('Erro ao cadastrar animal. Tente novamente.')
    }
  }

  const handleCancel = () => {
    router.push('/rebanho')
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full">
      <div className="max-w-4xl w-full mx-auto space-y-6 p-4">
        {/* Header com progresso */}
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cadastro de Animal</h1>
            <p className="text-muted-foreground">
              Passo {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>

        {/* Indicador de progresso */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo do passo atual */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Carregando espécies e raças...</p>
              </div>
            </div>
          ) : (
            <>
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identificacao_unica">Identificação Única *</Label>
                <Input
                  id="identificacao_unica"
                  placeholder="Ex: BR001"
                  value={animalData.identificacao_unica}
                  onChange={(e) => updateAnimalData('identificacao_unica', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_registro">Nome do Registro</Label>
                <Input
                  id="nome_registro"
                  placeholder="Ex: Estrela da Manhã"
                  value={animalData.nome_registro}
                  onChange={(e) => updateAnimalData('nome_registro', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brinco_eletronico">Brinco Eletrônico</Label>
                <Input
                  id="brinco_eletronico"
                  type="number"
                  placeholder="Ex: 982000123456789"
                  value={animalData.brinco_eletronico || ''}
                  onChange={(e) => updateAnimalData('brinco_eletronico', e.target.value)}
                  onKeyDown={(e) => {
                    // Permitir apenas números, backspace, delete, tab, escape, enter, home, end, left, right
                    if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Sexo *</Label>
                <RadioGroup
                  value={animalData.sexo}
                  onValueChange={(value) => updateAnimalData('sexo', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="macho" />
                    <Label htmlFor="macho">Macho</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="femea" />
                    <Label htmlFor="femea">Fêmea</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !animalData.data_nascimento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {animalData.data_nascimento ? (
                        format(animalData.data_nascimento, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={animalData.data_nascimento || undefined}
                      onSelect={(date) => updateAnimalData('data_nascimento', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especie">Espécie *</Label>
                  <Select value={animalData.especie} onValueChange={(value) => updateAnimalData('especie', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      {especies.map((especie) => (
                        <SelectItem key={especie.id} value={especie.nome}>{especie.nome_display}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raca">Raça *</Label>
                  <Select 
                    value={animalData.raca} 
                    onValueChange={(value) => updateAnimalData('raca', value)}
                    disabled={!animalData.especie}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={animalData.especie ? "Selecione a raça" : "Selecione a espécie primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getRacasPorEspecie(animalData.especie).map((raca) => (
                        <SelectItem key={raca.id} value={raca.id}>{raca.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    value={animalData.categoria} 
                    onValueChange={(value) => updateAnimalData('categoria', value)}
                    disabled={!animalData.especie}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={animalData.especie ? "Selecione a categoria" : "Selecione a espécie primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoriasPorEspecie().map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>{categoria.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peso_nascimento">Peso ao Nascer (kg)</Label>
                  <Input
                    id="peso_nascimento"
                    type="number"
                    placeholder="Ex: 35"
                    value={animalData.peso_nascimento || ''}
                    onChange={(e) => updateAnimalData('peso_nascimento', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso_atual">Peso Atual (kg)</Label>
                  <Input
                    id="peso_atual"
                    type="number"
                    placeholder="Ex: 380"
                    value={animalData.peso_atual || ''}
                    onChange={(e) => updateAnimalData('peso_atual', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input
                    id="altura"
                    type="number"
                    placeholder="Ex: 140"
                    value={animalData.altura || ''}
                    onChange={(e) => updateAnimalData('altura', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor_pelagem">Cor da Pelagem *</Label>
                <Select value={animalData.cor_pelagem} onValueChange={(value) => updateAnimalData('cor_pelagem', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {CORES_PELAGEM.map((cor) => (
                      <SelectItem key={cor} value={cor}>{cor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem *</Label>
                <Select value={animalData.origem} onValueChange={(value) => updateAnimalData('origem', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proprio">Próprio</SelectItem>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="leilao">Leilão</SelectItem>
                    <SelectItem value="doacao">Doação</SelectItem>
                    <SelectItem value="parceria">Parceria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pai">Pai</Label>
                  <Input
                    id="pai"
                    placeholder="Ex: Touro Rex"
                    value={animalData.pai || ''}
                    onChange={(e) => updateAnimalData('pai', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mae">Mãe</Label>
                  <Input
                    id="mae"
                    placeholder="Ex: Vaca Estrela"
                    value={animalData.mae || ''}
                    onChange={(e) => updateAnimalData('mae', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rgd">RGD (Registro Genealógico Definitivo)</Label>
                <Input
                  id="rgd"
                  placeholder="Ex: RGD123456"
                  value={animalData.rgd || ''}
                  onChange={(e) => updateAnimalData('rgd', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lote_atual">Lote Atual *</Label>
                  <Input
                    id="lote_atual"
                    placeholder="Ex: Lote A"
                    value={animalData.lote_atual}
                    onChange={(e) => updateAnimalData('lote_atual', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pasto">Pasto *</Label>
                  <Input
                    id="pasto"
                    placeholder="Ex: Pasto 1"
                    value={animalData.pasto}
                    onChange={(e) => updateAnimalData('pasto', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data de Entrada *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !animalData.data_entrada && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {animalData.data_entrada ? (
                        format(animalData.data_entrada, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={animalData.data_entrada || undefined}
                      onSelect={(date) => updateAnimalData('data_entrada', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={animalData.status} onValueChange={(value) => updateAnimalData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="morto">Morto</SelectItem>
                    <SelectItem value="transferido">Transferido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações gerais sobre o animal..."
                  value={animalData.observacoes || ''}
                  onChange={(e) => updateAnimalData('observacoes', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restricoes_alimentares">Restrições Alimentares</Label>
                <Textarea
                  id="restricoes_alimentares"
                  placeholder="Descreva restrições alimentares ou dietas especiais..."
                  value={animalData.restricoes_alimentares || ''}
                  onChange={(e) => updateAnimalData('restricoes_alimentares', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Resumo dos dados */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Resumo dos Dados</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Identificação:</span> {animalData.identificacao_unica}{animalData.nome_registro ? ` - ${animalData.nome_registro}` : ''}</p>
                  <p><span className="font-medium">Espécie:</span> {especies.find(e => e.nome === animalData.especie)?.nome_display || animalData.especie}</p>
                  <p><span className="font-medium">Animal:</span> {animalData.sexo === 'M' ? 'Macho' : 'Fêmea'} - {getRacasPorEspecie(animalData.especie).find(r => r.id === animalData.raca)?.nome || animalData.raca} - {getCategoriasPorEspecie().find(c => c.value === animalData.categoria)?.label || animalData.categoria}</p>
                  <p><span className="font-medium">Localização:</span> {animalData.lote_atual} - {animalData.pasto}</p>
                  {animalData.peso_atual && <p><span className="font-medium">Peso:</span> {animalData.peso_atual} kg</p>}
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentStep === STEPS.length ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Animal
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
