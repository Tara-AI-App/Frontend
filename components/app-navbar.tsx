"use client"

import { MessageSquare, BookOpen, User, Sparkles, Menu, LogIn, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useLocale } from "@/contexts/LocaleContext"
import { LanguageToggle } from "@/components/language-toggle"

export function AppNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { t } = useLocale()
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    {
      title: t("nav.askTara"),
      url: "/",
      icon: MessageSquare,
    },
    {
      title: t("nav.myLearning"),
      url: "/learning",
      icon: BookOpen,
    },
    {
      title: t("nav.profile"),
      url: "/profile",
      icon: User,
    },
  ]

  // Helper function to render user section
  const renderUserSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
        </div>
      )
    }
    
    if (isAuthenticated && user) {
      return (
        <div className="relative" ref={userDropdownRef}>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {user.country && (
              <Badge variant="outline" className="text-xs">
                {user.country}
              </Badge>
            )}
            <Avatar 
              className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <AvatarImage 
                src="/placeholder.svg" 
                alt={user.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute top-12 right-0 z-50 w-48 bg-background border border-border rounded-md shadow-lg">
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <User className="h-4 w-4" />
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={() => {
                    setShowUserDropdown(false)
                    // Add settings functionality here
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-4 w-4" />
                  {t("nav.settings")}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleLogout()
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            {t("nav.signIn")}
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">
            {t("nav.signUp")}
          </Button>
        </Link>
      </div>
    )
  }

  // Helper function to render medium screen user section
  const renderMediumScreenUserSection = () => {
    if (isLoading) {
      return <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
    }
    
    if (isAuthenticated && user) {
      return (
        <div className="relative" ref={userDropdownRef}>
          <Avatar 
            className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <AvatarImage 
              src="/placeholder.svg" 
              alt={user.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          
          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute top-10 right-0 z-50 w-48 bg-background border border-border rounded-md shadow-lg">
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <User className="h-4 w-4" />
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={() => {
                    setShowUserDropdown(false)
                    // Add settings functionality here
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-4 w-4" />
                  {t("nav.settings")}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleLogout()
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <Link href="/login">
        <Button variant="ghost" size="sm">
          <LogIn className="h-4 w-4" />
        </Button>
      </Link>
    )
  }

  // Helper function to render mobile user section
  const renderMobileUserSection = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2 px-2 pb-4 border-b">
          <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
        </div>
      )
    }
    
    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3 px-2 pb-4 border-b">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src="/placeholder.svg" 
              alt={user.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.country && (
              <Badge variant="outline" className="text-xs mt-1">
                {user.country}
              </Badge>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex flex-col gap-2 px-2 pb-4 border-b">
        <Link href="/login" onClick={() => setIsOpen(false)}>
          <Button variant="outline" className="w-full justify-start">
            <LogIn className="h-4 w-4 mr-2" />
            {t("nav.signIn")}
          </Button>
        </Link>
        <Link href="/signup" onClick={() => setIsOpen(false)}>
          <Button className="w-full justify-start">
            {t("nav.signUp")}
          </Button>
        </Link>
      </div>
    )
  }

  const handleLogout = () => {
    // Close dropdown immediately
    setShowUserDropdown(false)
    setIsOpen(false)
    
    try {
      logout()
      // Use window.location.href directly for immediate redirect
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if there's an error
      window.location.href = '/login'
    }
  }


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      // Use a small delay to ensure click events are processed first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showUserDropdown])

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold">Tara</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>

        {/* User Profile Section or Login Button */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <LanguageToggle />
          {renderUserSection()}
        </div>

        {/* Status Indicator for medium screens */}
        <div className="hidden md:flex lg:hidden items-center gap-2 ml-auto">
          <LanguageToggle />
          {renderMediumScreenUserSection()}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <LanguageToggle />
        </div>
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("nav.toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-6">
                {/* User Profile in Mobile */}
                {renderMobileUserSection()}

                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Tara</h1>
                    <p className="text-sm text-muted-foreground">{t("nav.aiLearningAssistant")}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  ))}
                  
                  {/* Logout option for authenticated users */}
                  {!isLoading && isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                      {t("nav.signOut")}
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">{t("nav.connectedIntegrations")}</p>
                    <div className="mt-2 flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-muted-foreground">GitHub, Drive, Confluence</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
