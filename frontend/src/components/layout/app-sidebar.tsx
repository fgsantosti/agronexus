"use client"

import * as React from "react"
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Home,
  PieChart,
  Settings2,
  Sprout,
  Stethoscope,
  TrendingUp,
  Baby,
  Beef,
} from "lucide-react"

import { NavMain } from "@/components/navigation/nav-main"
import { NavProjects } from "@/components/navigation/nav-projects"
import { NavUser } from "@/components/navigation/nav-user"
import { TeamSwitcher } from "@/components/navigation/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePropriedadesContext } from "@/contexts/PropriedadesContext"
import { type Propriedade } from "@/hooks/usePropriedades"

// Mapeamento de ícones para propriedades
const getPropriedadeIcon = (index: number) => {
  const icons = [Home, Sprout, Heart, PieChart]
  return icons[index % icons.length]
}

// Mapeamento de planos baseado na posição (primeira = mais recente = principal)
const getPropriedadePlano = (propriedade: Propriedade, index: number) => {
  // A primeira propriedade (mais recente) é sempre principal
  if (index === 0) return "Principal"
  // As demais são secundárias se ativas, senão inativas
  if (propriedade.ativa) return "Secundária"
  return "Inativa"
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { propriedades, loading, error } = usePropriedadesContext()
  const [isClient, setIsClient] = React.useState(false)

  // Garante que só renderiza do lado cliente para evitar hidratação mismatch
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Dados do usuário (mantido estático por enquanto)
  const userData = {
    name: "João Silva",
    email: "joao@fazendaverde.com.br",
    avatar: "", // Avatar vazio para usar as iniciais
  }

  // Converte propriedades da API para o formato esperado pelo TeamSwitcher
  // Ordena por data de criação (mais recente primeiro) e prioriza propriedades reais da API
  const teams = React.useMemo(() => {
    // Se ainda não é cliente, retorna dados de fallback para evitar hidratação mismatch
    if (!isClient) {
      return [
        {
          name: "Carregando...",
          logo: Home,
          plan: "...",
        },
      ]
    }

    // Se tem propriedades da API, usa elas
    if (propriedades.length > 0) {
      // Ordena propriedades por data de criação (mais recente primeiro)
      const propriedadesOrdenadas = [...propriedades].sort((a, b) => {
        const dateA = new Date(a.data_criacao).getTime()
        const dateB = new Date(b.data_criacao).getTime()
        return dateB - dateA // Mais recente primeiro
      })

      return propriedadesOrdenadas.map((propriedade, index) => ({
        name: propriedade.nome,
        logo: getPropriedadeIcon(index),
        plan: loading ? "Atualizando..." : getPropriedadePlano(propriedade, index),
        id: propriedade.id, // Adiciona o ID da propriedade
      }))
    }

    // Dados de fallback apenas quando não há propriedades da API
    return [
      {
        name: "Fazenda Verde",
        logo: Home,
        plan: "Principal",
      },
      {
        name: "Fazenda São João", 
        logo: Sprout,
        plan: "Secundária",
      },
      {
        name: "Sítio Esperança",
        logo: Heart,
        plan: "Parceria",
      },
    ]
  }, [propriedades, loading, isClient])

  // Dados de navegação (mantidos estáticos)
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard",
        },
        {
          title: "Relatórios",
          url: "/dashboard/relatorios",
        },
        {
          title: "Análises",
          url: "/dashboard/analises",
        },
      ],
    },
    {
      title: "Rebanho",
      url: "/rebanho",
      icon: Beef,
      items: [
        {
          title: "Animais",
          url: "/rebanho",
        },
        {
          title: "Lotes",
          url: "/lotes",
        },
        // Removido: Animais Externos
      ],
    },
    {
      title: "Sanidade",
      url: "/sanidade",
      icon: Stethoscope,
      items: [
        {
          title: "Tratamentos",
          url: "/sanidade/tratamentos",
        },
        {
          title: "Vacinas",
          url: "/sanidade/vacinas",
        },
        {
          title: "Exames",
          url: "/sanidade/exames",
        },
        {
          title: "Histórico",
          url: "/sanidade/historico",
        },
      ],
    },
    {
      title: "Reprodução",
      url: "/reproducao",
      icon: Baby,
      items: [
        {
          title: "Coberturas",
          url: "/reproducao/coberturas",
        },
        {
          title: "Nascimentos",
          url: "/reproducao/nascimentos",
        },
        {
          title: "Controle",
          url: "/reproducao/controle",
        },
      ],
    },
    {
      title: "Financeiro",
      url: "/financeiro",
      icon: CreditCard,
      items: [
        {
          title: "Receitas",
          url: "/financeiro/receitas",
        },
        {
          title: "Despesas",
          url: "/financeiro/despesas",
        },
        {
          title: "Fluxo de Caixa",
          url: "/financeiro/fluxo-caixa",
        },
        {
          title: "Relatórios",
          url: "/financeiro/relatorios",
        },
      ],
    },
    {
      title: "Calendário",
      url: "/calendario",
      icon: Calendar,
      items: [
        {
          title: "Eventos",
          url: "/calendario",
        },
        {
          title: "Lembretes",
          url: "/calendario/lembretes",
        },
        {
          title: "Planejamento",
          url: "/calendario/planejamento",
        },
      ],
    },
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: Settings2,
      items: [
        {
          title: "Propriedades",
          url: "/configuracoes/propriedades",
        },
        {
          title: "Usuários",
          url: "/configuracoes/usuarios",
        },
        {
          title: "Sistema",
          url: "/configuracoes/sistema",
        },
        {
          title: "Backup",
          url: "/configuracoes/backup",
        },
      ],
    },
  ]

  const projects = [
    {
      name: "Cadastrar Animal",
      url: "/rebanho",
      icon: Beef,
    },
    {
      name: "Registrar Tratamento",
      url: "/sanidade/tratamentos/novo",
      icon: Stethoscope,
    },
    {
      name: "Análise Financeira",
      url: "/financeiro/analise",
      icon: TrendingUp,
    },
    {
      name: "Relatório Mensal",
      url: "/relatorios/mensal",
      icon: FileText,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
