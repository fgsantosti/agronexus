'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, MapPin, Users, BarChart3, Trash2, AlertTriangle, Eye, UserPlus, Grid3X3, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLotes } from '@/hooks/useLotes'
import { useAnimais } from '@/hooks/useAnimais'
import { Lote, EstatisticasLote } from '@/types/lote'
import { Animal } from '@/types/animal'
import { AnimalCard } from '@/components/animal/animal-card'
import { AnimaisExternos } from '@/components/animais/AnimaisExternos'
import { HistoricoCompleto } from '@/components/historico/HistoricoCompleto'
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
  const { animais, getAnimaisByLote, loading: animaisLoading } = useAnimais()
  const [lote, setLote] = useState<Lote | null>(null)
  const [animaisDoLote, setAnimaisDoLote] = useState<Animal[]>([])
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  useEffect(() => {
    const loteEncontrado = lotes.find(l => l.id === loteId)
    setLote(loteEncontrado || null)
  }, [loteId, lotes])

  useEffect(() => {
    if (loteId) {
      const animaisLote = getAnimaisByLote(loteId)
      setAnimaisDoLote(animaisLote)
    }
  }, [loteId, getAnimaisByLote, animais])

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
          <TabsTrigger value="external">Animais Externos</TabsTrigger>
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

                {lote.aptidao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Aptidão</label>
                    <p className="capitalize">
                      {lote.aptidao === 'dupla_aptidao' ? 'Dupla Aptidão' : lote.aptidao}
                    </p>
                  </div>
                )}

                {lote.finalidade && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Finalidade</label>
                    <p className="capitalize">{lote.finalidade}</p>
                  </div>
                )}

                {lote.sistema_criacao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sistema de Criação</label>
                    <p className="capitalize">
                      {lote.sistema_criacao === 'semi_extensivo' ? 'Semi-extensivo' : lote.sistema_criacao}
                    </p>
                  </div>
                )}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Animais do Lote</CardTitle>
                  <CardDescription>
                    Lista de todos os animais pertencentes a este lote ({animaisDoLote.length} animais)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle de visualização */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button onClick={() => router.push(`/animais/novo?lote=${loteId}`)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Animal
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {animaisLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : animaisDoLote.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum animal encontrado neste lote
                  </p>
                  <Button onClick={() => router.push(`/animais/novo?lote=${loteId}`)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Animal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resumo dos animais */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{animaisDoLote.length}</div>
                        <div className="text-sm text-muted-foreground">Total de Animais</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {animaisDoLote.filter(a => a.sexo === 'M').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Machos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {animaisDoLote.filter(a => a.sexo === 'F').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Fêmeas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {animaisDoLote.filter(a => a.peso_atual).length > 0
                            ? Math.round(
                                animaisDoLote
                                  .filter(a => a.peso_atual)
                                  .reduce((acc, a) => acc + (a.peso_atual || 0), 0) /
                                animaisDoLote.filter(a => a.peso_atual).length
                              )
                            : 0}kg
                        </div>
                        <div className="text-sm text-muted-foreground">Peso Médio</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela ou Cards de animais */}
                  {viewMode === 'table' ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Identificação</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Sexo</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Raça</TableHead>
                            <TableHead>Peso Atual</TableHead>
                            <TableHead>GMD</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {animaisDoLote.map((animal) => (
                            <TableRow key={animal.id}>
                              <TableCell className="font-medium">
                                {animal.identificacao_unica}
                              </TableCell>
                              <TableCell>{animal.nome_registro || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={animal.sexo === 'M' ? 'default' : 'secondary'}>
                                  {animal.sexo === 'M' ? 'Macho' : 'Fêmea'}
                                </Badge>
                              </TableCell>
                              <TableCell>{animal.categoria}</TableCell>
                              <TableCell>{typeof animal.raca === 'string' ? animal.raca : animal.raca?.nome || '-'}</TableCell>
                              <TableCell>
                                {animal.peso_atual ? `${animal.peso_atual}kg` : '-'}
                              </TableCell>
                              <TableCell>
                                {animal.gmd ? `${animal.gmd}kg/dia` : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={animal.status === 'ativo' ? 'default' : 'secondary'}>
                                  {animal.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/animais/${animal.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/animais/${animal.id}/editar`)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {animaisDoLote.map((animal) => (
                        <AnimalCard
                          key={animal.id}
                          animal={animal}
                          onView={(id) => router.push(`/animais/${id}`)}
                          onEdit={(id) => router.push(`/animais/${id}/editar`)}
                          showMoveAction={true}
                          onMove={(id) => {
                            // TODO: Implementar funcionalidade de mover animal entre lotes
                            console.log('Mover animal:', id)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external">
          <AnimaisExternos 
            loteId={loteId}
            onAdicionarAnimal={() => {
              // TODO: Implementar modal para adicionar novo animal
              console.log('Adicionar novo animal')
            }}
          />
        </TabsContent>

        <TabsContent value="history">
          <HistoricoCompleto loteId={loteId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
