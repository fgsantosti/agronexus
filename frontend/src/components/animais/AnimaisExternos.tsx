'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, UserPlus, Table, Grid3X3, Filter } from 'lucide-react'
import { useAnimais } from '@/hooks/useAnimais'
import { Animal } from '@/types/animal'
import { AnimalCard } from '@/components/animal/animal-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AnimaisExternosProps {
  loteId: string
  onAdicionarAnimal?: () => void
}

export function AnimaisExternos({ loteId, onAdicionarAnimal }: AnimaisExternosProps) {
  const { 
    getAnimaisExternos, 
    moverAnimalParaLote, 
    loading 
  } = useAnimais()

  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [visualizacao, setVisualizacao] = useState<'cards' | 'tabela'>('cards')

  const animaisExternos = getAnimaisExternos()

  // Aplicar filtros
  const animaisFiltrados = animaisExternos.filter(animal => {
    const identificacao = animal.identificacao_unica.toLowerCase()
    const nome = animal.nome_registro?.toLowerCase() || ''
    const raca = String(animal.raca || '').toLowerCase()
    
    const matchBusca = identificacao.includes(busca.toLowerCase()) ||
                      nome.includes(busca.toLowerCase()) ||
                      raca.includes(busca.toLowerCase())
    
    const matchEspecie = filtroEspecie === 'todos' || String(animal.especie) === filtroEspecie
    const matchCategoria = filtroCategoria === 'todos' || animal.categoria === filtroCategoria
    
    return matchBusca && matchEspecie && matchCategoria
  })

  const handleAdicionarAnimalAoLote = async (animalId: string) => {
    const sucesso = await moverAnimalParaLote(animalId, loteId)
    if (sucesso) {
      // O animal será removido automaticamente da lista de externos
    }
  }

  // Estatísticas dos animais externos
  const stats = {
    total: animaisExternos.length,
    machos: animaisExternos.filter(a => a.sexo === 'M').length,
    femeas: animaisExternos.filter(a => a.sexo === 'F').length,
    pesoMedio: animaisExternos.length > 0 
      ? (animaisExternos.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / animaisExternos.length).toFixed(0)
      : '0'
  }

  const especies = [...new Set(animaisExternos.map(a => String(a.especie)))]
  const categorias = [...new Set(animaisExternos.map(a => a.categoria))]

  return (
    <div className="space-y-6">
      {/* Estatísticas dos Animais Externos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Externos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.machos}</div>
              <div className="text-sm text-muted-foreground">Machos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.femeas}</div>
              <div className="text-sm text-muted-foreground">Fêmeas</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.pesoMedio}kg</div>
              <div className="text-sm text-muted-foreground">Peso Médio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Busca e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Animais Externos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Animais disponíveis para adicionar ao lote
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={visualizacao === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('cards')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={visualizacao === 'tabela' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('tabela')}
              >
                <Table className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button onClick={onAdicionarAnimal} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Animal
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Busca e Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por identificação, nome ou raça..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Espécies</SelectItem>
                  {especies.map(especie => (
                    <SelectItem key={especie} value={especie}>
                      {especie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Categorias</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resultados */}
          <div className="text-sm text-muted-foreground">
            {animaisFiltrados.length} de {animaisExternos.length} animais externos
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Carregando animais...</div>
            </div>
          )}

          {!loading && animaisFiltrados.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {animaisExternos.length === 0 
                  ? 'Nenhum animal externo encontrado'
                  : 'Nenhum animal corresponde aos filtros aplicados'
                }
              </div>
            </div>
          )}

          {/* Lista de Animais */}
          {!loading && animaisFiltrados.length > 0 && (
            <>
              {visualizacao === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {animaisFiltrados.map(animal => (
                    <div key={animal.id} className="relative">
                      <AnimalCard 
                        animal={animal}
                        onView={() => {}}
                        onEdit={() => {}}
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          onClick={() => handleAdicionarAnimalAoLote(animal.id)}
                          disabled={loading}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">ID/Nome</th>
                        <th className="text-left p-3 font-medium">Espécie/Raça</th>
                        <th className="text-left p-3 font-medium">Categoria</th>
                        <th className="text-left p-3 font-medium">Peso</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {animaisFiltrados.map(animal => (
                        <tr key={animal.id} className="border-t hover:bg-muted/25">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{animal.identificacao_unica}</div>
                              {animal.nome_registro && (
                                <div className="text-sm text-muted-foreground">
                                  {animal.nome_registro}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>{String(animal.especie)}</div>
                              <div className="text-muted-foreground">{String(animal.raca || '')}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">{animal.categoria}</Badge>
                          </td>
                          <td className="p-3">
                            {animal.peso_atual ? `${animal.peso_atual}kg` : '-'}
                          </td>
                          <td className="p-3">
                            <Badge variant={animal.status === 'ativo' ? 'default' : 'secondary'}>
                              {animal.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleAdicionarAnimalAoLote(animal.id)}
                              disabled={loading}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
