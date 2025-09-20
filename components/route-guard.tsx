"use client"

import { useAuth } from "@/contexts/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

interface RouteGuardProps {
  readonly children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Don't redirect if still loading or if it's a public route
    if (isLoading || isPublicRoute) {
      return
    }

    // Redirect to login if not authenticated and trying to access protected route
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If it's a public route, render children directly
  if (isPublicRoute) {
    return <>{children}</>
  }

  // If not authenticated and not a public route, don't render children
  // (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
