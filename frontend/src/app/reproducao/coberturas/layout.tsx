import DashboardLayout from "@/components/layout/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Coberturas" description="Gerencie as coberturas do rebanho">
      {children}
    </DashboardLayout>
  );
}
