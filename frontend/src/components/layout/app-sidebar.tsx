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

// Dados do AgroNexus
const data = {
  user: {
    name: "João Silva",
    email: "joao@fazendaverde.com.br",
    avatar: "/avatars/user.jpg",
  },
  teams: [
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
  ],
  navMain: [
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
  ],
  projects: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
