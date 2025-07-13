import { CadastroAnimal } from "@/components/animal"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function CadastroAnimalPage() {
  return (
    <DashboardLayout title="Cadastro de Animal" description="Cadastre um novo animal no rebanho">
      <div className="h-full w-full">
        <CadastroAnimal />
      </div>
    </DashboardLayout>
  )
}
