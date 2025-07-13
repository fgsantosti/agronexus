'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, MapPin, Users, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLotes } from '@/hooks/useLotes'
import { LoteFormData } from '@/types/lote'

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

export function CadastroLote() {
  const router = useRouter()
  const { criarLote, loading } = useLotes()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<LoteFormData>({
    nome: '',
    descricao: '',
    criterio_agrupamento: '',
    area_atual_id: '',
    ativo: true
  })

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
      const sucesso = await criarLote({
        ...formData,
        area_atual_id: formData.area_atual_id || undefined
      })
      
      if (sucesso) {
        router.push('/lotes')
      } else {
        alert('Erro ao criar lote. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao criar lote:', error)
      alert('Erro ao criar lote. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/lotes')
  }

  const areasDisponiveis = AREAS_DISPONIVEIS.filter(area => area.status === 'disponivel')

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
            <h1 className="text-2xl font-bold">Novo Lote</h1>
            <p className="text-muted-foreground">
              Crie um novo lote para organizar seus animais
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
              Defina o nome e as características do lote
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
                <Select value={formData.aptidao || 'none'} onValueChange={(value) => handleChange('aptidao', value === 'none' ? '' : value)}>
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
                <Select value={formData.finalidade || 'none'} onValueChange={(value) => handleChange('finalidade', value === 'none' ? '' : value)}>
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
                <Select value={formData.sistema_criacao || 'none'} onValueChange={(value) => handleChange('sistema_criacao', value === 'none' ? '' : value)}>
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
              Defina onde o lote será alocado inicialmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="area">Área Atual</Label>
              <Select value={formData.area_atual_id || 'sem-area'} onValueChange={(value) => handleChange('area_atual_id', value === 'sem-area' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-area">Sem área definida</SelectItem>
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
              {areasDisponiveis.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma área disponível no momento
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
              Configure o status inicial do lote
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
            {saving ? 'Criando...' : 'Criar Lote'}
          </Button>
        </div>
      </form>
    </div>
  )
}
