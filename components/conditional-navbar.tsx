"use client"

import { usePathname } from "next/navigation"
import { AppNavbar } from "@/components/app-navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide navbar on authentication pages
  const authPages = ['/login', '/signup']
  const shouldShowNavbar = !authPages.includes(pathname)
  
  if (!shouldShowNavbar) {
    return null
  }
  
  return <AppNavbar />
}
