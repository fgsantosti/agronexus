import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import withAuth from "../withAuth"

function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" description="Visão geral do sistema">
      <DashboardContent />
    </DashboardLayout>
  )
}

export default withAuth(DashboardPage)
