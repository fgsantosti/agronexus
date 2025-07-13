import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function Page() {
  return (
    <DashboardLayout title="Dashboard" description="Visão geral do sistema">
      <DashboardContent />
    </DashboardLayout>
  )
}
