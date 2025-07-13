import DashboardLayout from "@/components/layout/dashboard-layout"

export default function RebanhoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout title="Rebanho" description="Gerencie seus animais">
      {children}
    </DashboardLayout>
  )
}