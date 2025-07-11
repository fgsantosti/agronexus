"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock, MapPin, Plus } from "lucide-react"

interface Lembrete {
  id: string
  titulo: string
  descricao: string
  data: string
  hora: string
  local?: string
  prioridade: "baixa" | "media" | "alta"
  categoria: "sanidade" | "reproducao" | "manejo" | "financeiro"
  ativo: boolean
}

const lembretes: Lembrete[] = [
  {
    id: "1",
    titulo: "Vacinação contra Febre Aftosa",
    descricao: "Aplicar vacina em todo o rebanho reprodutor",
    data: "2025-07-15",
    hora: "08:00",
    local: "Curral Central",
    prioridade: "alta",
    categoria: "sanidade",
    ativo: true,
  },
  {
    id: "2",
    titulo: "Verificação de Prenhez",
    descricao: "Exame de ultrassom nas vacas cobertas",
    data: "2025-07-18",
    hora: "14:00",
    local: "Pasto Norte",
    prioridade: "media",
    categoria: "reproducao",
    ativo: true,
  },
  {
    id: "3",
    titulo: "Pagamento de Ração",
    descricao: "Vencimento da fatura do fornecedor de ração",
    data: "2025-07-20",
    hora: "10:00",
    prioridade: "alta",
    categoria: "financeiro",
    ativo: true,
  },
  {
    id: "4",
    titulo: "Pesagem dos Bezerros",
    descricao: "Controle de peso mensal dos bezerros",
    data: "2025-07-25",
    hora: "07:00",
    local: "Balança",
    prioridade: "media",
    categoria: "manejo",
    ativo: true,
  },
]

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case "alta": return "bg-red-500"
    case "media": return "bg-yellow-500"
    case "baixa": return "bg-green-500"
    default: return "bg-gray-500"
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

export default function LembretesPage() {
  const [lembretesAtivos, setLembretesAtivos] = useState(lembretes)

  const toggleLembrete = (id: string) => {
    setLembretesAtivos(
      lembretesAtivos.map(lembrete =>
        lembrete.id === id ? { ...lembrete, ativo: !lembrete.ativo } : lembrete
      )
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lembretes</h1>
          <p className="text-muted-foreground">
            Configure lembretes para suas atividades pecuárias
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lembrete
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lembretesAtivos.map((lembrete) => (
          <Card key={lembrete.id} className={`${!lembrete.ativo ? 'opacity-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-3 h-3 rounded-full ${getPrioridadeColor(lembrete.prioridade)}`} />
                <Badge variant="secondary" className={getCategoriaColor(lembrete.categoria)}>
                  {lembrete.categoria}
                </Badge>
              </div>
              <CardTitle className="text-lg">{lembrete.titulo}</CardTitle>
              <CardDescription>{lembrete.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(lembrete.data).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {lembrete.hora}
                </div>
                {lembrete.local && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {lembrete.local}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLembrete(lembrete.id)}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {lembrete.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
