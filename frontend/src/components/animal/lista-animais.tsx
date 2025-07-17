'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Settings
} from 'lucide-react'
import { ExportAnimais } from './export-animais'
import { Animal, RebanhoStats, FiltrosAnimal } from '@/types/animal'
import { useAnimaisImportados } from '@/hooks/useAnimaisImportados'
import { useLotes } from '@/hooks/useLotes'

export function ListaAnimais() {
  const router = useRouter()
  const { animais: animaisImportados, loading: loadingImportados, estatisticas, limparAnimais } = useAnimaisImportados()
  const { lotes, loading: loadingLotes } = useLotes()
  const [animais, setAnimais] = useState<Animal[]>([])
  const [stats, setStats] = useState<RebanhoStats>({
    total_animais: 0,
    lotes_com_animais: 0,
    peso_medio: 0,
    peso_total: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('animais')
  const [filtros, setFiltros] = useState<FiltrosAnimal>({
    categoria: '',
    sexo: '',
    status: 'ativo',
    lote: ''
  })

  // Combinar dados mockados com animais importados
  useEffect(() => {
    // Mock de dados - substitua pela sua API
    const mockAnimais: Animal[] = [
      {
        id: '1',
        identificacao_unica: 'BR001',
        nome_registro: 'Estrela',
        especie: 'bovino',
        sexo: 'F',
        data_nascimento: '2022-03-15',
        raca: 'Nelore',
        categoria: 'novilha',
        status: 'ativo',
        peso_atual: 380,
        lote_atual: 'Lote A',
        gmd: 0.85
      },
      {
        id: '2',
        identificacao_unica: 'BR002',
        nome_registro: 'Touro Rex',
        especie: 'bovino',
        sexo: 'M',
        data_nascimento: '2021-01-10',
        raca: 'Angus',
        categoria: 'touro',
        status: 'ativo',
        peso_atual: 750,
        lote_atual: 'Reprodutor',
        gmd: 0.45
      }
    ]

    // Converter animais importados para o formato Animal
    const animaisConvertidos: Animal[] = animaisImportados.map(animal => ({
      id: animal.id,
      identificacao_unica: animal.identificacao_unica,
      nome_registro: animal.nome_registro || '',
      especie: animal.especie,
      sexo: animal.sexo as 'M' | 'F',
      data_nascimento: animal.data_nascimento,
      raca: animal.raca || '',
      categoria: animal.categoria,
      status: animal.status,
      peso_atual: animal.peso_atual,
      lote_atual: animal.lote_atual || '',
      observacoes: animal.observacoes,
      pai: animal.pai,
      mae: animal.mae
    }))

    // Combinar animais mockados com importados
    const todosAnimais = [...mockAnimais, ...animaisConvertidos]
    setAnimais(todosAnimais)

    // Calcular estatísticas
    const totalPeso = todosAnimais.reduce((sum, animal) => sum + (animal.peso_atual || 0), 0)
    const lotesUnicos = new Set(todosAnimais.map(animal => animal.lote_atual).filter(Boolean))
    
    setStats({
      total_animais: todosAnimais.length,
      lotes_com_animais: lotesUnicos.size,
      peso_medio: todosAnimais.length > 0 ? totalPeso / todosAnimais.length : 0,
      peso_total: totalPeso
    })
    
    setLoading(loadingImportados)
  }, [animaisImportados, loadingImportados])

  const handleSaveAnimal = (animalData: Partial<Animal>) => {
    // Aqui você salvaria via API
    console.log('Salvando animal:', animalData)
    
    // Mock: adicionar à lista
    const novoAnimal: Animal = {
      id: Date.now().toString(),
      identificacao_unica: animalData.identificacao_unica || '',
      nome_registro: animalData.nome_registro || '',
      especie: animalData.especie || 'bovino',
      sexo: animalData.sexo || 'M',
      data_nascimento: animalData.data_nascimento || '',
      raca: animalData.raca || '',
      categoria: animalData.categoria || 'bezerro',
      status: animalData.status || 'ativo',
      peso_atual: 0,
      lote_atual: '',
      gmd: 0
    }
    
    setAnimais(prev => [...prev, novoAnimal])
    setStats(prev => ({
      ...prev,
      total_animais: prev.total_animais + 1
    }))
  }

  const animaisFiltrados = animais.filter(animal => {
    const matchSearch = animal.identificacao_unica.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       animal.nome_registro.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !filtros.categoria || animal.categoria === filtros.categoria
    const matchSexo = !filtros.sexo || animal.sexo === filtros.sexo
    const matchStatus = !filtros.status || animal.status === filtros.status
    
    return matchSearch && matchCategoria && matchSexo && matchStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'vendido': return 'bg-blue-100 text-blue-800'
      case 'morto': return 'bg-red-100 text-red-800'
      case 'descartado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSexoIcon = (sexo: string) => {
    return sexo === 'M' ? '♂' : '♀'
  }

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    const diffTime = hoje.getTime() - nascimento.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} dias`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
    return `${Math.floor(diffDays / 365)} anos`
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/rebanho/importar')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Animais
          </Button>
          <Button 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => router.push('/rebanho/cadastro')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Animal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TOTAL DE ANIMAIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_animais}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LOTES COM ANIMAIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lotes_com_animais}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PESO MÉDIO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peso_medio} kg</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PESO TOTAL @
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peso_total} @</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="animais">ANIMAIS</TabsTrigger>
          <TabsTrigger value="lotes">LOTES</TabsTrigger>
        </TabsList>

        <TabsContent value="animais" className="space-y-4">
          {/* Info sobre animais importados */}
          {animaisImportados.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Animais Importados</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  {animaisImportados.length} animais foram importados e estão destacados na tabela abaixo.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-blue-900">Por Espécie:</div>
                    {Object.entries(estatisticas.porEspecie).map(([especie, count]) => (
                      <div key={especie} className="text-blue-700">
                        {especie}: {count}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Por Sexo:</div>
                    {Object.entries(estatisticas.porSexo).map(([sexo, count]) => (
                      <div key={sexo} className="text-blue-700">
                        {sexo === 'M' ? 'Machos' : 'Fêmeas'}: {count}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Por Lote:</div>
                    {Object.entries(estatisticas.porLote).slice(0, 3).map(([lote, count]) => (
                      <div key={lote} className="text-blue-700">
                        {lote}: {count}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Status:</div>
                    <div className="text-blue-700">Ativos: {animaisImportados.filter(a => a.status === 'ativo').length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por brinco ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{animaisFiltrados.length} itens</span>
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-muted-foreground">ORDENAR POR</span>
                  <Button variant="outline" size="sm">
                    Número
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                  {animaisImportados.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Deseja limpar todos os animais importados? Esta ação não pode ser desfeita.')) {
                          limparAnimais()
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Limpar Importados
                    </Button>
                  )}
                  <ExportAnimais 
                    animais={animais} 
                    animaisFiltrados={animaisFiltrados} 
                  />
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Brinco Elet.</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Peso @</TableHead>
                    <TableHead>Pesagem</TableHead>
                    <TableHead>GMD</TableHead>
                    <TableHead>Mais</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animaisFiltrados.map((animal) => {
                    const isImportado = animaisImportados.some(imp => imp.id === animal.id)
                    return (
                      <TableRow key={animal.id} className={isImportado ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                              {getSexoIcon(animal.sexo)}
                            </div>
                            {isImportado && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                IMP
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {animal.identificacao_unica}
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <div>
                            <div>{animal.nome_registro}</div>
                            <div className="text-xs text-muted-foreground">
                              {typeof animal.especie === 'string' ? animal.especie : animal.especie.nome_display}
                              {animal.raca && ` • ${typeof animal.raca === 'string' ? animal.raca : animal.raca.nome}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{animal.lote_atual}</Badge>
                        </TableCell>
                        <TableCell>{animal.peso_atual ? `${animal.peso_atual} kg` : '-'}</TableCell>
                        <TableCell>{animal.peso_atual ? `${(animal.peso_atual / 15).toFixed(1)} @` : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {calcularIdade(animal.data_nascimento)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {animal.gmd ? `${animal.gmd.toFixed(2)} kg/dia` : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Lotes</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie os lotes de animais da propriedade
              </p>
            </div>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => router.push('/lotes/novo')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lote
            </Button>
          </div>

          {/* Stats dos lotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  TOTAL DE LOTES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lotes.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  LOTES ATIVOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lotes.filter(lote => lote.ativo).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  TOTAL DE ANIMAIS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lotes.reduce((total, lote) => total + (lote.total_animais || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de lotes */}
          <Card>
            <CardContent className="p-0">
              {loadingLotes ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-muted-foreground">Carregando lotes...</div>
                </div>
              ) : lotes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Nenhum lote cadastrado ainda
                  </div>
                  <Button 
                    onClick={() => router.push('/lotes/novo')}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Lote
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Critério</TableHead>
                      <TableHead>Área Atual</TableHead>
                      <TableHead>Animais</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotes.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lote.nome}</div>
                            {lote.descricao && (
                              <div className="text-sm text-muted-foreground">
                                {lote.descricao.substring(0, 50)}
                                {lote.descricao.length > 50 ? '...' : ''}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {lote.criterio_agrupamento}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lote.area_atual ? (
                            <div>
                              <div className="font-medium">{lote.area_atual.nome}</div>
                              <div className="text-xs text-muted-foreground">
                                {lote.area_atual.tipo} • {lote.area_atual.tamanho_ha}ha
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem área</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-bold">{lote.total_animais || 0}</div>
                            <div className="text-xs text-muted-foreground">animais</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lote.ativo ? 'default' : 'secondary'}>
                            {lote.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/lotes/${lote.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/lotes/${lote.id}/editar`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Link para gerenciamento completo */}
          <div className="text-center">
            <Button 
              variant="outline"
              onClick={() => router.push('/lotes')}
            >
              Ver Gerenciamento Completo de Lotes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
