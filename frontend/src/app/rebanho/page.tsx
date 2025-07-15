import { ListaAnimais } from "@/components/animal"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function RebanhoPage() {
  return (
    <DashboardLayout title="Rebanho" description="Rebanho de animais">
      <ListaAnimais />
    </DashboardLayout>
  )
}
