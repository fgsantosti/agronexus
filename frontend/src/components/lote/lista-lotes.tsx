'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  Power,
  PowerOff
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLotes } from '@/hooks/useLotes'
import { Lote } from '@/types/lote'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ListaLotes() {
  const router = useRouter()
  const { lotes, loading, excluirLote, alternarStatusLote } = useLotes()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [loteParaExcluir, setLoteParaExcluir] = useState<Lote | null>(null)

  // Filtrar lotes
  const lotesFiltrados = lotes.filter(lote => {
    const matchBusca = lote.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      lote.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
                      lote.criterio_agrupamento.toLowerCase().includes(busca.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || 
                       (filtroStatus === 'ativo' && lote.ativo) ||
                       (filtroStatus === 'inativo' && !lote.ativo)
    
    return matchBusca && matchStatus
  })

  const handleExcluirLote = async () => {
    if (!loteParaExcluir) return
    
    const sucesso = await excluirLote(loteParaExcluir.id)
    if (sucesso) {
      setLoteParaExcluir(null)
    }
  }

  const handleAlternarStatus = async (lote: Lote) => {
    await alternarStatusLote(lote.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando lotes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Lotes</h1>
          <p className="text-muted-foreground">
            Organize seus animais em lotes para facilitar o manejo
          </p>
        </div>
        <Button onClick={() => router.push('/lotes/novo')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lote
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, descrição ou critério..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Lotes</p>
                <p className="text-2xl font-bold">{lotes.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lotes Ativos</p>
                <p className="text-2xl font-bold">{lotes.filter(l => l.ativo).length}</p>
              </div>
              <Power className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Animais</p>
                <p className="text-2xl font-bold">{lotes.reduce((acc, lote) => acc + lote.total_animais, 0)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de lotes */}
      <Card>
        <CardHeader>
          <CardTitle>Lotes ({lotesFiltrados.length})</CardTitle>
          <CardDescription>
            Lista de todos os lotes da propriedade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lotesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum lote encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {busca || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro lote'
                }
              </p>
              {!busca && filtroStatus === 'todos' && (
                <Button onClick={() => router.push('/lotes/novo')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Lote
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Critério de Agrupamento</TableHead>
                    <TableHead>Área Atual</TableHead>
                    <TableHead>Animais</TableHead>
                    <TableHead>Total UA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotesFiltrados.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lote.nome}</div>
                          {lote.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {lote.descricao}
                            </div>
                          )}
                          {/* Características do lote */}
                          <div className="flex gap-1 mt-1">
                            {lote.aptidao && (
                              <Badge variant="outline" className="text-xs">
                                {lote.aptidao === 'dupla_aptidao' ? 'Dupla Aptidão' : 
                                 lote.aptidao === 'corte' ? 'Corte' : 'Leite'}
                              </Badge>
                            )}
                            {lote.finalidade && (
                              <Badge variant="secondary" className="text-xs">
                                {lote.finalidade === 'cria' ? 'Cria' : 
                                 lote.finalidade === 'recria' ? 'Recria' : 'Engorda'}
                              </Badge>
                            )}
                            {lote.sistema_criacao && (
                              <Badge variant="outline" className="text-xs">
                                {lote.sistema_criacao === 'semi_extensivo' ? 'Semi-extensivo' : 
                                 lote.sistema_criacao === 'intensivo' ? 'Intensivo' : 'Extensivo'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{lote.criterio_agrupamento}</div>
                      </TableCell>
                      <TableCell>
                        {lote.area_atual ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{lote.area_atual.nome}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sem área</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>{lote.total_animais}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{lote.total_ua.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lote.ativo ? "default" : "secondary"}>
                          {lote.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(lote.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/lotes/${lote.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/lotes/${lote.id}/editar`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAlternarStatus(lote)}>
                              {lote.ativo ? (
                                <PowerOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Power className="w-4 h-4 mr-2" />
                              )}
                              {lote.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setLoteParaExcluir(lote)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!loteParaExcluir} onOpenChange={() => setLoteParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lote "{loteParaExcluir?.nome}"?
              Esta ação não pode ser desfeita e todos os animais do lote serão desvinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluirLote} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
