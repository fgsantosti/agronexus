
"use client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import withAuth from "../withAuth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

function DashboardPage() {
  const router = useRouter()
  const { makeAuthenticatedRequest, isAuthenticated } = useAuth()

  useEffect(() => {
    async function checkPropriedades() {
      try {
        if (!isAuthenticated()) {
          router.replace("/login")
          return
        }
        
        const res = await makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/usuarios/me/`
        )
        
        if (!res.ok) return
        
        const data = await res.json()
        if (!data.propriedades || data.propriedades.length === 0) {
          router.replace("/propriedades/adicionar")
        }
      } catch (error) {
        console.error('Erro ao verificar propriedades:', error)
        // Se houver erro de autenticação, o makeAuthenticatedRequest já lidou com isso
      }
    }
    checkPropriedades()
  }, [router, makeAuthenticatedRequest, isAuthenticated])

  return (
    <DashboardLayout title="Dashboard" description="Visão geral do sistema">
      <DashboardContent />
    </DashboardLayout>
  )
}

export default withAuth(DashboardPage)
