'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, MapPin, Users, FileText, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLotes } from '@/hooks/useLotes'
import { Lote, LoteFormData } from '@/types/lote'

interface Area {
  id: string
  nome: string
  tipo: string
  tamanho_ha: number
  status: 'disponivel' | 'em_uso' | 'manutencao'
}

// Simulando áreas disponíveis
const AREAS_DISPONIVEIS: Area[] = [
  { id: 'area-1', nome: 'Pasto Norte', tipo: 'pastagem', tamanho_ha: 25.5, status: 'disponivel' },
  { id: 'area-2', nome: 'Piquete Central', tipo: 'piquete', tamanho_ha: 8.0, status: 'disponivel' },
  { id: 'area-3', nome: 'Campo Sul', tipo: 'campo', tamanho_ha: 45.0, status: 'disponivel' },
  { id: 'area-4', nome: 'Curral Principal', tipo: 'curral', tamanho_ha: 2.0, status: 'disponivel' },
  { id: 'area-5', nome: 'Baia 1', tipo: 'baia', tamanho_ha: 0.5, status: 'disponivel' }
]

const CRITERIOS_SUGERIDOS = [
  'Bezerros desmamados',
  'Novilhas 12-18 meses',
  'Novilhas 18-24 meses',
  'Vacas gestantes',
  'Vacas secas',
  'Touros reprodutores',
  'Animais para engorda',
  'Animais doentes',
  'Fêmeas reprodutoras',
  'Machos castrados',
  'Outros'
]

interface EditarLoteProps {
  loteId: string
}

export function EditarLote({ loteId }: EditarLoteProps) {
  const router = useRouter()
  const { lotes, atualizarLote, loading } = useLotes()
  const [lote, setLote] = useState<Lote | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<LoteFormData>({
    nome: '',
    descricao: '',
    criterio_agrupamento: '',
    area_atual_id: '',
    aptidao: undefined,
    finalidade: undefined,
    sistema_criacao: undefined,
    ativo: true
  })

  useEffect(() => {
    const loteEncontrado = lotes.find(l => l.id === loteId)
    if (loteEncontrado) {
      setLote(loteEncontrado)
      setFormData({
        nome: loteEncontrado.nome,
        descricao: loteEncontrado.descricao || '',
        criterio_agrupamento: loteEncontrado.criterio_agrupamento,
        area_atual_id: loteEncontrado.area_atual_id || '',
        aptidao: loteEncontrado.aptidao,
        finalidade: loteEncontrado.finalidade,
        sistema_criacao: loteEncontrado.sistema_criacao,
        ativo: loteEncontrado.ativo
      })
    }
  }, [loteId, lotes])

  const handleChange = (field: keyof LoteFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.criterio_agrupamento?.trim()) {
      alert('Nome e critério de agrupamento são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const sucesso = await atualizarLote(loteId, {
        ...formData,
        area_atual_id: formData.area_atual_id || undefined
      })
      
      if (sucesso) {
        router.push(`/lotes/${loteId}`)
      } else {
        alert('Erro ao atualizar lote. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao atualizar lote:', error)
      alert('Erro ao atualizar lote. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/lotes/${loteId}`)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (!lote) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lote não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O lote solicitado não foi encontrado ou foi removido.
          </p>
          <Button onClick={() => router.push('/lotes')}>
            Voltar para Lotes
          </Button>
        </div>
      </div>
    )
  }

  const areasDisponiveis = AREAS_DISPONIVEIS.filter(area => 
    area.status === 'disponivel' || area.id === lote.area_atual_id
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Lote</h1>
            <p className="text-muted-foreground">
              Editando: {lote.nome}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Edite o nome e as características do lote
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Lote *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Lote Novilhas 2024"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="criterio">Critério de Agrupamento *</Label>
                <Select value={formData.criterio_agrupamento || ""} onValueChange={(value) => handleChange('criterio_agrupamento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um critério" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRITERIOS_SUGERIDOS.map((criterio) => (
                      <SelectItem key={criterio} value={criterio}>
                        {criterio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aptidao">Aptidão</Label>
                <Select 
                  value={formData.aptidao || "none"} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    aptidao: value === "none" ? undefined : value as 'corte' | 'leite' | 'dupla_aptidao'
                  }))}
                >
                  <SelectTrigger id="aptidao">
                    <SelectValue placeholder="Selecione a aptidão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    <SelectItem value="corte">Corte</SelectItem>
                    <SelectItem value="leite">Leite</SelectItem>
                    <SelectItem value="dupla_aptidao">Dupla Aptidão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade</Label>
                <Select 
                  value={formData.finalidade || "none"} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    finalidade: value === "none" ? undefined : value as 'cria' | 'recria' | 'engorda'
                  }))}
                >
                  <SelectTrigger id="finalidade">
                    <SelectValue placeholder="Selecione a finalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    <SelectItem value="cria">Cria</SelectItem>
                    <SelectItem value="recria">Recria</SelectItem>
                    <SelectItem value="engorda">Engorda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sistema_criacao">Sistema de Criação</Label>
                <Select 
                  value={formData.sistema_criacao || "none"} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    sistema_criacao: value === "none" ? undefined : value as 'intensivo' | 'extensivo' | 'semi_extensivo'
                  }))}
                >
                  <SelectTrigger id="sistema_criacao">
                    <SelectValue placeholder="Selecione o sistema de criação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    <SelectItem value="intensivo">Intensivo</SelectItem>
                    <SelectItem value="extensivo">Extensivo</SelectItem>
                    <SelectItem value="semi_extensivo">Semi-extensivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva as características do lote..."
                value={formData.descricao || ''}
                onChange={(e) => handleChange('descricao', e.target.value)}
                rows={3}
              />
            </div>

            {/* Características do Lote */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aptidao">Aptidão</Label>
                <Select value={formData.aptidao || 'none'} onValueChange={(value) => handleChange('aptidao', value === 'none' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a aptidão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificada</SelectItem>
                    <SelectItem value="corte">Corte</SelectItem>
                    <SelectItem value="leite">Leite</SelectItem>
                    <SelectItem value="dupla_aptidao">Dupla Aptidão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade</Label>
                <Select value={formData.finalidade || 'none'} onValueChange={(value) => handleChange('finalidade', value === 'none' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a finalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificada</SelectItem>
                    <SelectItem value="cria">Cria</SelectItem>
                    <SelectItem value="recria">Recria</SelectItem>
                    <SelectItem value="engorda">Engorda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sistema_criacao">Sistema de Criação</Label>
                <Select value={formData.sistema_criacao || 'none'} onValueChange={(value) => handleChange('sistema_criacao', value === 'none' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    <SelectItem value="intensivo">Intensivo</SelectItem>
                    <SelectItem value="extensivo">Extensivo</SelectItem>
                    <SelectItem value="semi_extensivo">Semi-Extensivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização
            </CardTitle>
            <CardDescription>
              Defina onde o lote está alocado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="area">Área Atual</Label>
              <Select value={formData.area_atual_id || 'none'} onValueChange={(value) => handleChange('area_atual_id', value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem área definida</SelectItem>
                  {areasDisponiveis.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{area.nome}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {area.tipo} - {area.tamanho_ha}ha
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {lote.area_atual && (
                <p className="text-sm text-muted-foreground">
                  Área atual: {lote.area_atual.nome} ({lote.area_atual.tipo})
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Configure o status do lote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleChange('ativo', checked)}
              />
              <Label htmlFor="ativo">Lote ativo</Label>
              <span className="text-sm text-muted-foreground">
                (Lotes inativos não aparecem em seleções)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
