import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard,
  Beef,
  Heart,
  Stethoscope,
  MapPin,
  DollarSign,
  FileText,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Target,
  Bell,
  Home
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const navigation = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      current: true,
      href: '#'
    },
    {
      name: 'Rebanho',
      icon: Beef,
      current: false,
      href: '#'
    },
    {
      name: 'Manejos',
      icon: Target,
      current: false,
      href: '#'
    },
    {
      name: 'Sanidade',
      icon: Stethoscope,
      current: false,
      href: '#'
    },
    {
      name: 'Reprodução',
      icon: Heart,
      current: false,
      href: '#'
    },
    {
      name: 'Propriedades',
      icon: MapPin,
      current: false,
      href: '#'
    },
    {
      name: 'Financeiro',
      icon: DollarSign,
      current: false,
      href: '#'
    },
    {
      name: 'Relatórios',
      icon: FileText,
      current: false,
      href: '#'
    },
    {
      name: 'Usuários',
      icon: Users,
      current: false,
      href: '#'
    },
    {
      name: 'Agenda',
      icon: Calendar,
      current: false,
      href: '#'
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      current: false,
      href: '#'
    },
    {
      name: 'Configurações',
      icon: Settings,
      current: false,
      href: '#'
    }
  ]

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        {/* Logo */}
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="h-8 w-8 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">AgroNexus</h2>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.current && "bg-green-50 text-green-700 hover:bg-green-100"
                )}
                asChild
              >
                <a href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-2">
          <h3 className="mb-2 px-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Ações Rápidas
          </h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Beef className="mr-2 h-4 w-4" />
              Novo Animal
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Target className="mr-2 h-4 w-4" />
              Novo Manejo
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Stethoscope className="mr-2 h-4 w-4" />
              Agendar Vacina
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Bell className="mr-2 h-4 w-4" />
              Ver Alertas
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
