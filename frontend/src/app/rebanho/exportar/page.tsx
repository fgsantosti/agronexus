import { ExportAnimais } from "@/components/animal"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function ExportarAnimaisPage() {
  return (
    <DashboardLayout title="Exportar Animais" description="Exporte dados dos animais em diferentes formatos">
      <div className="h-full w-full">
        {/* Aqui você pode adicionar o componente de exportação com dados dos animais */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            A funcionalidade de exportação está integrada na página de listagem de animais.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Acesse Rebanho → Lista de Animais para usar a ferramenta de exportação.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
