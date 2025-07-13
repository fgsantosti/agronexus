'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Calendar, 
  Users, 
  MapPin, 
  Weight, 
  Syringe, 
  Heart, 
  Baby, 
  DollarSign, 
  AlertTriangle,
  Edit,
  Plus,
  Filter,
  Clock,
  User
} from 'lucide-react'
import { useHistoricoLoteCompleto, MovimentacaoHistorico } from '@/hooks/useHistoricoLoteCompleto'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HistoricoCompletoProps {
  loteId: string
}

const TIPO_ICONS: Record<MovimentacaoHistorico['tipo'], React.ReactNode> = {
  criacao_lote: <Plus className="h-4 w-4" />,
  atualizacao_lote: <Edit className="h-4 w-4" />,
  adicao_animal: <Users className="h-4 w-4" />,
  remocao_animal: <Users className="h-4 w-4" />,
  movimentacao_animal: <MapPin className="h-4 w-4" />,
  mudanca_area: <MapPin className="h-4 w-4" />,
  pesagem: <Weight className="h-4 w-4" />,
  vacinacao: <Syringe className="h-4 w-4" />,
  tratamento: <Heart className="h-4 w-4" />,
  reproducao: <Heart className="h-4 w-4" />,
  desmame: <Baby className="h-4 w-4" />,
  venda: <DollarSign className="h-4 w-4" />,
  morte: <AlertTriangle className="h-4 w-4" />,
  status_change: <Edit className="h-4 w-4" />
}

const TIPO_CORES: Record<MovimentacaoHistorico['tipo'], string> = {
  criacao_lote: 'bg-green-500',
  atualizacao_lote: 'bg-blue-500',
  adicao_animal: 'bg-purple-500',
  remocao_animal: 'bg-orange-500',
  movimentacao_animal: 'bg-cyan-500',
  mudanca_area: 'bg-indigo-500',
  pesagem: 'bg-yellow-500',
  vacinacao: 'bg-emerald-500',
  tratamento: 'bg-pink-500',
  reproducao: 'bg-rose-500',
  desmame: 'bg-violet-500',
  venda: 'bg-green-600',
  morte: 'bg-red-500',
  status_change: 'bg-gray-500'
}

const TIPO_LABELS: Record<MovimentacaoHistorico['tipo'], string> = {
  criacao_lote: 'Criação',
  atualizacao_lote: 'Atualização',
  adicao_animal: 'Adição Animal',
  remocao_animal: 'Remoção Animal',
  movimentacao_animal: 'Movimentação',
  mudanca_area: 'Mudança Área',
  pesagem: 'Pesagem',
  vacinacao: 'Vacinação',
  tratamento: 'Tratamento',
  reproducao: 'Reprodução',
  desmame: 'Desmame',
  venda: 'Venda',
  morte: 'Morte',
  status_change: 'Status'
}

export function HistoricoCompleto({ loteId }: HistoricoCompletoProps) {
  const { 
    historico, 
    loading, 
    error, 
    carregarHistorico, 
    filtrarPorTipo, 
    getEstatisticas 
  } = useHistoricoLoteCompleto()

  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (loteId) {
      carregarHistorico(loteId)
    }
  }, [loteId, carregarHistorico])

  // Aplicar filtros
  const historicoFiltrado = historico.filter(mov => {
    const matchTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo
    const matchBusca = mov.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      mov.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      (mov.usuario && mov.usuario.toLowerCase().includes(busca.toLowerCase()))
    
    return matchTipo && matchBusca
  })

  const estatisticas = getEstatisticas()
  const tiposDisponiveis = Object.keys(estatisticas.por_tipo) as MovimentacaoHistorico['tipo'][]

  const formatarData = (dataHora: string) => {
    return new Date(dataHora).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarValor = (valor: any) => {
    if (typeof valor === 'number') {
      return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    }
    return String(valor || '')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas do Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
              <div className="text-sm text-muted-foreground">Total Movimentações</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estatisticas.por_tipo.adicao_animal || 0}
              </div>
              <div className="text-sm text-muted-foreground">Adições de Animais</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {estatisticas.por_tipo.tratamento || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tratamentos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {estatisticas.por_tipo.venda || 0}
              </div>
              <div className="text-sm text-muted-foreground">Vendas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico Completo do Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar por título, descrição ou usuário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                {tiposDisponiveis.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_LABELS[tipo]} ({estatisticas.por_tipo[tipo]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {historicoFiltrado.length} de {historico.length} movimentações
          </div>

          {/* Timeline do Histórico */}
          <div className="space-y-4">
            {historicoFiltrado.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {historico.length === 0 
                    ? 'Nenhuma movimentação encontrada'
                    : 'Nenhuma movimentação corresponde aos filtros aplicados'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historicoFiltrado.map((mov, index) => (
                  <div key={mov.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className={`w-3 h-3 ${TIPO_CORES[mov.tipo]} rounded-full mt-2 flex-shrink-0`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {TIPO_ICONS[mov.tipo]}
                          <h4 className="font-medium">{mov.titulo}</h4>
                          <Badge variant="outline" className="text-xs">
                            {TIPO_LABELS[mov.tipo]}
                          </Badge>
                        </div>
                        <time className="text-sm text-muted-foreground">
                          {formatarData(mov.data_hora)}
                        </time>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        {mov.descricao}
                      </p>
                      
                      {mov.usuario && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>{mov.usuario}</span>
                        </div>
                      )}

                      {/* Dados adicionais específicos por tipo */}
                      {mov.dados_adicionais && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mov.tipo === 'pesagem' && mov.dados_adicionais.peso_medio_atual && (
                            <Badge variant="secondary" className="text-xs">
                              Peso Médio: {mov.dados_adicionais.peso_medio_atual}kg
                            </Badge>
                          )}
                          {mov.tipo === 'venda' && mov.dados_adicionais.valor_total && (
                            <Badge variant="secondary" className="text-xs">
                              Valor: {formatarValor(mov.dados_adicionais.valor_total)}
                            </Badge>
                          )}
                          {mov.tipo === 'vacinacao' && mov.dados_adicionais.vacina && (
                            <Badge variant="secondary" className="text-xs">
                              Vacina: {mov.dados_adicionais.vacina}
                            </Badge>
                          )}
                          {mov.tipo === 'tratamento' && mov.dados_adicionais.medicamento && (
                            <Badge variant="secondary" className="text-xs">
                              Medicamento: {mov.dados_adicionais.medicamento}
                            </Badge>
                          )}
                          {mov.animais_envolvidos && mov.animais_envolvidos.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {mov.animais_envolvidos.length} {mov.animais_envolvidos.length === 1 ? 'Animal' : 'Animais'}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Valores anterior e novo para mudanças */}
                      {(mov.valor_anterior || mov.valor_novo) && (
                        <div className="flex gap-4 mt-2 text-xs">
                          {mov.valor_anterior && (
                            <span className="text-red-600">
                              Anterior: {String(mov.valor_anterior)}
                            </span>
                          )}
                          {mov.valor_novo && (
                            <span className="text-green-600">
                              Novo: {String(mov.valor_novo)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
