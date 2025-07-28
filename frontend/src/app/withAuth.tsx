
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function withAuth(Component: any) {
  return function AuthenticatedPage(props: any) {
    const router = useRouter()
    useEffect(() => {
      const access = typeof window !== "undefined" ? localStorage.getItem("access") : null
      if (!access) {
        router.replace("/login")
      }
    }, [router])
    return <Component {...props} />
  }
}
