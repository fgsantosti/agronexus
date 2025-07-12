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

export function ListaAnimais() {
  const router = useRouter()
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

  // Mock de dados - substitua pela sua API
  useEffect(() => {
    // Simular carregamento
    const mockAnimais: Animal[] = [
      {
        id: '1',
        identificacao_unica: 'BR001',
        nome_registro: 'Estrela',
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

    setAnimais(mockAnimais)
    setStats({
      total_animais: mockAnimais.length,
      lotes_com_animais: 2,
      peso_medio: 565,
      peso_total: mockAnimais.reduce((sum, animal) => sum + (animal.peso_atual || 0), 0)
    })
    setLoading(false)
  }, [])

  const handleSaveAnimal = (animalData: Partial<Animal>) => {
    // Aqui você salvaria via API
    console.log('Salvando animal:', animalData)
    
    // Mock: adicionar à lista
    const novoAnimal: Animal = {
      id: Date.now().toString(),
      identificacao_unica: animalData.identificacao_unica || '',
      nome_registro: animalData.nome_registro || '',
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
          <TabsTrigger value="reprodutores">REPRODUTORES EXTERNOS</TabsTrigger>
        </TabsList>

        <TabsContent value="animais" className="space-y-4">
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
                  {animaisFiltrados.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {getSexoIcon(animal.sexo)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {animal.identificacao_unica}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{animal.nome_registro}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lotes">
          <Card>
            <CardHeader>
              <CardTitle>Lotes</CardTitle>
              <CardDescription>Gerencie os lotes de animais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidade de lotes será implementada aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reprodutores">
          <Card>
            <CardHeader>
              <CardTitle>Reprodutores Externos</CardTitle>
              <CardDescription>Gerencie reprodutores externos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidade de reprodutores externos será implementada aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
