
"use client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import withAuth from "../withAuth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkPropriedades() {
      try {
        const access = typeof window !== "undefined" ? localStorage.getItem("access") : null
        if (!access) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/usuarios/me/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`
          }
        })
        if (!res.ok) return
        const data = await res.json()
        if (!data.propriedades || data.propriedades.length === 0) {
          router.replace("/propriedades/adicionar")
        }
      } catch {}
    }
    checkPropriedades()
  }, [router])

  return (
    <DashboardLayout title="Dashboard" description="Visão geral do sistema">
      <DashboardContent />
    </DashboardLayout>
  )
}

export default withAuth(DashboardPage)
