
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function withAuth(Component: any) {
  return function AuthenticatedPage(props: any) {
    const router = useRouter()
    const { makeAuthenticatedRequest, isAuthenticated, handleAuthError } = useAuth()
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [isValidToken, setIsValidToken] = useState(false)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          if (!isAuthenticated()) {
            router.replace("/login")
            return
          }

          // Verifica se o token é válido fazendo uma chamada para a API
          const response = await makeAuthenticatedRequest(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/usuarios/me/`
          )

          if (response.ok) {
            setIsValidToken(true)
          }
        } catch (error) {
          // Se chegou aqui, o makeAuthenticatedRequest já tratou o erro 401
          console.error('Erro na verificação de autenticação:', error)
        } finally {
          setIsAuthChecked(true)
        }
      }

      checkAuth()
    }, [router, makeAuthenticatedRequest, isAuthenticated, handleAuthError])

    // Mostra loading enquanto verifica autenticação
    if (!isAuthChecked) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    // Só renderiza o componente se o token for válido
    if (!isValidToken) {
      return null
    }

    return <Component {...props} />
  }
}
