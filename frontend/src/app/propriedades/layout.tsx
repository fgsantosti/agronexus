import DashboardLayout from "@/components/layout/dashboard-layout"

export default function PropriedadesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout title="Propriedades" description="Gerencie suas propriedades rurais">
      {children}
    </DashboardLayout>
  )
}
