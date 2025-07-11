"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, Plus, Target } from "lucide-react"

interface Plano {
  id: string
  titulo: string
  descricao: string
  dataInicio: string
  dataFim: string
  progresso: number
  status: "planejado" | "em-andamento" | "concluido" | "atrasado"
  categoria: "sanidade" | "reproducao" | "manejo" | "financeiro"
  tarefas: {
    id: string
    nome: string
    concluida: boolean
    dataLimite: string
  }[]
}

const planos: Plano[] = [
  {
    id: "1",
    titulo: "Programa de Vacinação Anual",
    descricao: "Planejamento completo de vacinação para todo o rebanho",
    dataInicio: "2025-07-01",
    dataFim: "2025-12-31",
    progresso: 35,
    status: "em-andamento",
    categoria: "sanidade",
    tarefas: [
      { id: "1", nome: "Vacinação contra Febre Aftosa", concluida: true, dataLimite: "2025-07-15" },
      { id: "2", nome: "Vacinação contra Brucelose", concluida: false, dataLimite: "2025-08-20" },
      { id: "3", nome: "Vermifugação", concluida: false, dataLimite: "2025-09-15" },
    ],
  },
  {
    id: "2",
    titulo: "Estação de Monta 2025",
    descricao: "Planejamento da estação reprodutiva",
    dataInicio: "2025-08-01",
    dataFim: "2025-11-30",
    progresso: 15,
    status: "planejado",
    categoria: "reproducao",
    tarefas: [
      { id: "4", nome: "Seleção de reprodutores", concluida: false, dataLimite: "2025-07-25" },
      { id: "5", nome: "Exame andrológico", concluida: false, dataLimite: "2025-08-05" },
      { id: "6", nome: "Sincronização de cios", concluida: false, dataLimite: "2025-08-15" },
    ],
  },
  {
    id: "3",
    titulo: "Reforma de Pastagens",
    descricao: "Recuperação e melhoria das pastagens degradadas",
    dataInicio: "2025-09-01",
    dataFim: "2025-12-15",
    progresso: 0,
    status: "planejado",
    categoria: "manejo",
    tarefas: [
      { id: "7", nome: "Análise de solo", concluida: false, dataLimite: "2025-09-10" },
      { id: "8", nome: "Correção do solo", concluida: false, dataLimite: "2025-10-01" },
      { id: "9", nome: "Plantio de forragem", concluida: false, dataLimite: "2025-11-01" },
    ],
  },
  {
    id: "4",
    titulo: "Planejamento Financeiro Q4",
    descricao: "Orçamento e planejamento financeiro para o último trimestre",
    dataInicio: "2025-10-01",
    dataFim: "2025-12-31",
    progresso: 0,
    status: "planejado",
    categoria: "financeiro",
    tarefas: [
      { id: "10", nome: "Análise de custos", concluida: false, dataLimite: "2025-10-15" },
      { id: "11", nome: "Projeção de receitas", concluida: false, dataLimite: "2025-10-30" },
      { id: "12", nome: "Orçamento anual", concluida: false, dataLimite: "2025-11-30" },
    ],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "concluido": return "bg-green-100 text-green-800"
    case "em-andamento": return "bg-blue-100 text-blue-800"
    case "atrasado": return "bg-red-100 text-red-800"
    case "planejado": return "bg-gray-100 text-gray-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case "sanidade": return "bg-blue-100 text-blue-800"
    case "reproducao": return "bg-pink-100 text-pink-800"
    case "manejo": return "bg-green-100 text-green-800"
    case "financeiro": return "bg-orange-100 text-orange-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export default function PlanejamentoPage() {
  const [planosAtivos, setPlanosAtivos] = useState(planos)

  const toggleTarefa = (planoId: string, tarefaId: string) => {
    setPlanosAtivos(
      planosAtivos.map(plano => {
        if (plano.id === planoId) {
          const tarefasAtualizadas = plano.tarefas.map(tarefa => 
            tarefa.id === tarefaId ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
          )
          const tarefasConcluidas = tarefasAtualizadas.filter(t => t.concluida).length
          const novoProgresso = Math.round((tarefasConcluidas / tarefasAtualizadas.length) * 100)
          
          return { 
            ...plano, 
            tarefas: tarefasAtualizadas,
            progresso: novoProgresso,
            status: novoProgresso === 100 ? "concluido" : (novoProgresso > 0 ? "em-andamento" : "planejado")
          }
        }
        return plano
      })
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planejamento</h1>
          <p className="text-muted-foreground">
            Organize e acompanhe seus planos de manejo e gestão
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {planosAtivos.map((plano) => (
          <Card key={plano.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={getCategoriaColor(plano.categoria)}>
                  {plano.categoria}
                </Badge>
                <Badge variant="secondary" className={getStatusColor(plano.status)}>
                  {plano.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{plano.titulo}</CardTitle>
              <CardDescription>{plano.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span>{plano.progresso}%</span>
                  </div>
                  <Progress value={plano.progresso} className="w-full" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(plano.dataInicio).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    {new Date(plano.dataFim).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Tarefas</h4>
                  <div className="space-y-1">
                    {plano.tarefas.map((tarefa) => (
                      <div key={tarefa.id} className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => toggleTarefa(plano.id, tarefa.id)}
                        >
                          <CheckCircle 
                            className={`h-4 w-4 ${tarefa.concluida ? 'text-green-500' : 'text-gray-300'}`}
                          />
                        </Button>
                        <span className={`text-sm ${tarefa.concluida ? 'line-through text-muted-foreground' : ''}`}>
                          {tarefa.nome}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(tarefa.dataLimite).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
