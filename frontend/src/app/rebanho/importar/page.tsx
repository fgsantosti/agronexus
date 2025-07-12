import { ImportarAnimais } from "@/components/animal"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function ImportarAnimaisPage() {
  return (
    <DashboardLayout title="Importar Animais" description="Importe animais em lote através de planilha">
      <div className="h-full w-full">
        <ImportarAnimais />
      </div>
    </DashboardLayout>
  )
}