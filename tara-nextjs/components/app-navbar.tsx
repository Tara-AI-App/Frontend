"use client"

import { MessageSquare, BookOpen, User, Sparkles, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Ask Tara",
    url: "/",
    icon: MessageSquare,
  },
  {
    title: "My Learning",
    url: "/learning",
    icon: BookOpen,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

// Mock user data
const userData = {
  fullName: "Sarah Chen",
  title: "Senior Software Engineer",
  team: "Data Science Engineering - Growth Team",
  avatar: "/images/profile-avatar.png",
}

export function AppNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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

        {/* User Profile Section */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <div className="text-right">
            <p className="text-sm font-medium">{userData.fullName}</p>
            <p className="text-xs text-muted-foreground">{userData.title}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {userData.team}
          </Badge>
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Status Indicator for medium screens */}
        <div className="hidden md:flex lg:hidden items-center gap-2 ml-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden ml-auto">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-6">
                {/* User Profile in Mobile */}
                <div className="flex items-center gap-3 px-2 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userData.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{userData.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{userData.title}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {userData.team}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Tara</h1>
                    <p className="text-sm text-muted-foreground">AI Learning Assistant</p>
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
                </div>

                <div className="mt-auto pt-6 border-t">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">Connected Integrations</p>
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
