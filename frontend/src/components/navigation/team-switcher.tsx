"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    id?: string // Adiciona ID opcional para navegação
  }[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  // Atualiza o team ativo quando a lista de teams muda
  React.useEffect(() => {
    if (teams.length > 0) {
      setActiveTeam(teams[0]) // Sempre seleciona o primeiro (mais recente)
    }
  }, [teams])

  const handleAdicionarPropriedade = () => {
    router.push('/propriedades/adicionar')
  }

  const handleVerDetalhes = (team: { name: string, id?: string }, event: React.MouseEvent) => {
    event.stopPropagation() // Previne que o dropdown feche
    if (team.id) {
      router.push(`/propriedades/${team.id}`)
    } else {
      router.push('/propriedades')
    }
  }

  if (!activeTeam || teams.length === 0) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Propriedades
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                className="gap-2 p-2 flex items-center"
                asChild
              >
                <div>
                  <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => setActiveTeam(team)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <team.logo className="size-3.5 shrink-0" />
                    </div>
                    <span className="flex-1">{team.name}</span>
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </div>
                  <button
                    onClick={(e) => handleVerDetalhes(team, e)}
                    className="flex items-center justify-center size-6 rounded-md hover:bg-blue-100 hover:text-blue-600 transition-colors ml-2"
                    title="Ver detalhes da propriedade"
                  >
                    <Eye className="size-3.5" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={handleAdicionarPropriedade}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Adicionar propriedade</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
