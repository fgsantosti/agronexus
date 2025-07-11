'use client'

import React from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Beef, 
  Heart, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Bell,
  Settings,
  ChevronDown,
  Plus,
  Eye,
  FileText,
  Activity,
  Target,
  Stethoscope,
  Scale,
  Syringe,
  Milk,
  BarChart3,
  PieChart,
  LineChart,
  Menu
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar, Pie } from 'recharts'

// Dados simulados para demonstração
const dashboardData = {
  totalAnimais: 1247,
  animaisVacinados: 987,
  animaisParaVacinar: 260,
  totalPropriedades: 5,
  pesoMedioRebanho: 420,
  taxaNatalidade: 87.5,
  valorPatrimonio: 1850000,
  ultimosManejos: [
    { id: 1, animal: 'Boi 001', tipo: 'Pesagem', data: '2024-01-10', responsavel: 'João Silva', resultado: '450kg' },
    { id: 2, animal: 'Vaca 034', tipo: 'Vacinação', data: '2024-01-10', responsavel: 'Maria Santos', resultado: 'Febre Aftosa' },
    { id: 3, animal: 'Bezerro 127', tipo: 'Medicação', data: '2024-01-09', responsavel: 'Carlos Lima', resultado: 'Vermífugo' },
    { id: 4, animal: 'Vaca 089', tipo: 'Inseminação', data: '2024-01-09', responsavel: 'Ana Costa', resultado: 'IA - Touro Elite' },
    { id: 5, animal: 'Boi 245', tipo: 'Pesagem', data: '2024-01-08', responsavel: 'Pedro Oliveira', resultado: '485kg' },
  ],
  proximosManejos: [
    { id: 1, animal: 'Lote 05', tipo: 'Vacinação', data: '2024-01-15', responsavel: 'João Silva', observacao: '15 animais' },
    { id: 2, animal: 'Vaca 156', tipo: 'Diagnóstico Gestação', data: '2024-01-16', responsavel: 'Dr. Veterinário', observacao: 'Ultrasom' },
    { id: 3, animal: 'Bezerros', tipo: 'Desmame', data: '2024-01-18', responsavel: 'Equipe', observacao: '23 animais' },
    { id: 4, animal: 'Lote 12', tipo: 'Pesagem', data: '2024-01-20', responsavel: 'Maria Santos', observacao: '30 animais' },
  ],
  alertas: [
    { id: 1, tipo: 'Vacina Vencida', animal: 'Lote 03', data: '2024-01-12', prioridade: 'alta' },
    { id: 2, tipo: 'Animal Doente', animal: 'Vaca 087', data: '2024-01-11', prioridade: 'alta' },
    { id: 3, tipo: 'Estoque Baixo', item: 'Ração Premium', data: '2024-01-10', prioridade: 'media' },
    { id: 4, tipo: 'Manutenção', item: 'Bebedouro Piquete 5', data: '2024-01-09', prioridade: 'baixa' },
  ]
}

const pesoData = [
  { mes: 'Jan', peso: 410 },
  { mes: 'Fev', peso: 415 },
  { mes: 'Mar', peso: 420 },
  { mes: 'Abr', peso: 425 },
  { mes: 'Mai', peso: 430 },
  { mes: 'Jun', peso: 435 },
]

const categoriasAnimais = [
  { name: 'Vacas', value: 45, color: '#8884d8' },
  { name: 'Touros', value: 15, color: '#82ca9d' },
  { name: 'Novilhas', value: 25, color: '#ffc658' },
  { name: 'Bezerros', value: 15, color: '#ff7300' },
]

const reproducaoData = [
  { mes: 'Jan', inseminacoes: 12, nascimentos: 8 },
  { mes: 'Fev', inseminacoes: 15, nascimentos: 10 },
  { mes: 'Mar', inseminacoes: 18, nascimentos: 12 },
  { mes: 'Abr', inseminacoes: 20, nascimentos: 15 },
  { mes: 'Mai', inseminacoes: 22, nascimentos: 18 },
  { mes: 'Jun', inseminacoes: 25, nascimentos: 20 },
]

export default function DashboardWithSidebar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-4 ml-4 lg:ml-0">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Fazenda São João
                  </Badge>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Notificações</span>
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Novo Manejo</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Configurações</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Preferências</DropdownMenuItem>
                    <DropdownMenuItem>Sair</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
                <Beef className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalAnimais.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor do Patrimônio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {dashboardData.valorPatrimonio.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +8% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Natalidade</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.taxaNatalidade}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peso Médio</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pesoMedioRebanho}kg</div>
                <p className="text-xs text-muted-foreground">
                  +5kg em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Alertas e Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.alertas.map((alerta) => (
                  <div key={alerta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alerta.prioridade === 'alta' ? 'bg-red-500' : 
                        alerta.prioridade === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium">{alerta.tipo}</p>
                        <p className="text-sm text-gray-600">{alerta.animal || alerta.item} - {alerta.data}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs do Dashboard */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="animals">Rebanho</TabsTrigger>
              <TabsTrigger value="health">Sanidade</TabsTrigger>
              <TabsTrigger value="reproduction">Reprodução</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Peso */}
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do Peso Médio</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={pesoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="peso" stroke="#8884d8" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico de Categoria de Animais */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição do Rebanho</CardTitle>
                    <CardDescription>Por categoria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={categoriasAnimais}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoriasAnimais.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Manejos Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Manejos Recentes</CardTitle>
                  <CardDescription>Últimas atividades realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Animal</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Resultado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.ultimosManejos.map((manejo) => (
                          <TableRow key={manejo.id}>
                            <TableCell className="font-medium">{manejo.animal}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{manejo.tipo}</Badge>
                            </TableCell>
                            <TableCell>{manejo.data}</TableCell>
                            <TableCell>{manejo.responsavel}</TableCell>
                            <TableCell>{manejo.resultado}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="animals" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Beef className="h-5 w-5 mr-2" />
                      Status do Rebanho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Animais Saudáveis</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">1.180</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Em Tratamento</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">15</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Quarentena</span>
                        <Badge variant="outline" className="bg-red-50 text-red-700">3</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Distribuição por Piquetes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Piquete 1</span>
                        <Badge variant="outline">245 animais</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Piquete 2</span>
                        <Badge variant="outline">312 animais</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Piquete 3</span>
                        <Badge variant="outline">198 animais</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Piquete 4</span>
                        <Badge variant="outline">267 animais</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Metas do Mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Pesagens</span>
                          <span>75/100</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Vacinações</span>
                          <span>45/60</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Inseminações</span>
                          <span>12/20</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="h-5 w-5 mr-2" />
                      Status Sanitário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Animais Vacinados</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={79} className="w-20 h-2" />
                          <span className="text-sm font-medium">987/1247</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Vermifugação em Dia</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={85} className="w-20 h-2" />
                          <span className="text-sm font-medium">1060/1247</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Exames Realizados</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={65} className="w-20 h-2" />
                          <span className="text-sm font-medium">810/1247</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Syringe className="h-5 w-5 mr-2" />
                      Próximas Vacinações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Febre Aftosa</p>
                          <p className="text-sm text-gray-600">Lote 05 - 15/01/2024</p>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-700">Urgente</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Clostridiose</p>
                          <p className="text-sm text-gray-600">Bezerros - 18/01/2024</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Programada</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Brucelose</p>
                          <p className="text-sm text-gray-600">Novilhas - 22/01/2024</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Planejada</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reproduction" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reprodução - Últimos 6 Meses</CardTitle>
                    <CardDescription>Inseminações vs Nascimentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={reproducaoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="inseminacoes" fill="#8884d8" name="Inseminações" />
                        <Bar dataKey="nascimentos" fill="#82ca9d" name="Nascimentos" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Índices Reprodutivos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Taxa de Prenhez</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">87.5%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Taxa de Natalidade</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">85.2%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Intervalo entre Partos</span>
                        <Badge variant="outline">398 dias</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Idade ao Primeiro Parto</span>
                        <Badge variant="outline">26 meses</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Gestações em Andamento</CardTitle>
                  <CardDescription>Controle de prenhez</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Animal</TableHead>
                          <TableHead>Data IA</TableHead>
                          <TableHead>Gestação</TableHead>
                          <TableHead>Previsão Parto</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Vaca 089</TableCell>
                          <TableCell>2023-08-15</TableCell>
                          <TableCell>150 dias</TableCell>
                          <TableCell>2024-05-12</TableCell>
                          <TableCell><Badge variant="outline" className="bg-green-50 text-green-700">Confirmada</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Vaca 156</TableCell>
                          <TableCell>2023-09-02</TableCell>
                          <TableCell>132 dias</TableCell>
                          <TableCell>2024-05-30</TableCell>
                          <TableCell><Badge variant="outline" className="bg-yellow-50 text-yellow-700">Exame Pendente</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Vaca 234</TableCell>
                          <TableCell>2023-09-10</TableCell>
                          <TableCell>124 dias</TableCell>
                          <TableCell>2024-06-07</TableCell>
                          <TableCell><Badge variant="outline" className="bg-green-50 text-green-700">Confirmada</Badge></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Relatórios Rápidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Rebanho por Categoria
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <PieChart className="h-4 w-4 mr-2" />
                        Distribuição por Piquetes
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <LineChart className="h-4 w-4 mr-2" />
                        Evolução de Peso
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="h-4 w-4 mr-2" />
                        Manejos do Mês
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Relatórios Financeiros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Custos por Animal
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <PieChart className="h-4 w-4 mr-2" />
                        Gastos por Categoria
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <LineChart className="h-4 w-4 mr-2" />
                        Receitas vs Despesas
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        ROI por Propriedade
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Relatórios Periódicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Relatório Semanal
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Relatório Mensal
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Relatório Trimestral
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Relatório Anual
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
