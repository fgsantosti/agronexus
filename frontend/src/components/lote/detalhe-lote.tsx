'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, MapPin, Users, BarChart3, Trash2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLotes } from '@/hooks/useLotes'
import { Lote, EstatisticasLote } from '@/types/lote'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DetalheLoteProps {
  loteId: string
}

export function DetalheLote({ loteId }: DetalheLoteProps) {
  const router = useRouter()
  const { lotes, excluirLote, loading } = useLotes()
  const [lote, setLote] = useState<Lote | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loteEncontrado = lotes.find(l => l.id === loteId)
    setLote(loteEncontrado || null)
  }, [loteId, lotes])

  const handleDelete = async () => {
    if (!lote) return
    
    setDeleting(true)
    try {
      const sucesso = await excluirLote(lote.id)
      if (sucesso) {
        router.push('/lotes')
      }
    } catch (error) {
      console.error('Erro ao deletar lote:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/lotes/${loteId}/editar`)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (!lote) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/lotes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{lote.nome}</h1>
            <p className="text-muted-foreground">
              {lote.criterio_agrupamento}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={lote.ativo ? 'default' : 'secondary'}>
            {lote.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o lote "{lote.nome}"? 
                  Esta ação não pode ser desfeita e todos os animais 
                  do lote ficarão sem lote.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="animals">Animais</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lote.estatisticas?.basicas.total_animais || lote.total_animais || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Machos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lote.estatisticas?.distribuicao.por_sexo.find(s => s.sexo === 'M')?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fêmeas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lote.estatisticas?.distribuicao.por_sexo.find(s => s.sexo === 'F')?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peso Médio</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lote.estatisticas?.basicas.peso_medio ? `${lote.estatisticas.basicas.peso_medio.toFixed(0)} kg` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Lote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p>{lote.nome}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Critério de Agrupamento</label>
                  <p>{lote.criterio_agrupamento}</p>
                </div>
                
                {lote.descricao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                    <p>{lote.descricao}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={lote.ativo ? 'default' : 'secondary'} className="ml-2">
                    {lote.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localização Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lote.area_atual ? (
                  <div className="space-y-2">
                    <p className="font-medium">{lote.area_atual.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {lote.area_atual.tipo} • {lote.area_atual.tamanho_ha}ha
                    </p>
                    <Badge variant="outline">
                      {lote.area_atual.status}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem área definida</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Histórico de movimentações recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentações Recentes</CardTitle>
              <CardDescription>
                Últimas alterações no lote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Lote criado</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(lote.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline">Criação</Badge>
                </div>
                
                {lote.data_ultima_atualizacao && lote.data_ultima_atualizacao !== lote.data_criacao && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Última atualização</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lote.data_ultima_atualizacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="outline">Atualização</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animals">
          <Card>
            <CardHeader>
              <CardTitle>Animais do Lote</CardTitle>
              <CardDescription>
                Lista de todos os animais pertencentes a este lote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Funcionalidade de listagem de animais será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Completo</CardTitle>
              <CardDescription>
                Todas as movimentações e alterações do lote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Histórico detalhado será implementado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
