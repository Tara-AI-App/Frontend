"use client"

import { User, Clock, BookOpen, Target, TrendingUp, Award, Mail, MapPin, Calendar, LogOut, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

// Mock profile stats - in a real app, this would come from API
const profileStats = {
  learningTime: 1250, // minutes
  totalCoursesLearned: 12,
  skills: ["React", "Node.js", "TypeScript", "Docker", "AWS", "GraphQL"],
  averageQuizScore: 87.5,
  medianQuizScore: 89.0,
  completionRate: 78.3,
  learningPathProgression: 65.2,
}

const recentAchievements = [
  { title: "Fast Learner", description: "Completed 3 courses this week", icon: TrendingUp },
  { title: "Quiz Master", description: "Scored 95%+ on 5 consecutive quizzes", icon: Award },
  { title: "Consistent Learner", description: "7-day learning streak", icon: Target },
]

export function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    // Use a consistent format to prevent hydration mismatches
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-3 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative" ref={dropdownRef}>
                  <Avatar 
                    className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <AvatarImage 
                      src="/placeholder.svg" 
                      alt={user?.name || "User"}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-24 left-0 z-50 w-48 bg-background border border-border rounded-md shadow-lg">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            // Add settings functionality here
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowLogoutConfirm(true)
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{user?.name || "User"}</h1>
                    <p className="text-lg text-muted-foreground">{user?.email || "No email"}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user?.email || "No email"}
                    </div>
                    {user?.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.country}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {user?.created_at ? formatJoinDate(user.created_at) : "Unknown"}
                    </div>
                  </div>

                  {user?.country && (
                    <Badge variant="outline" className="w-fit">
                      {user.country}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-blue-600 text-white">
                <User className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Learning Dashboard</h2>
                <p className="text-sm md:text-base text-muted-foreground">Track your progress and achievements</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Learning Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{formatTime(profileStats.learningTime)}</div>
                <p className="text-xs text-muted-foreground">Total time spent learning</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Courses Completed</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{profileStats.totalCoursesLearned}</div>
                <p className="text-xs text-muted-foreground">Courses successfully finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Average Quiz Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{profileStats.averageQuizScore}%</div>
                <p className="text-xs text-muted-foreground">Median: {profileStats.medianQuizScore}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{profileStats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Course completion rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Acquired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileStats.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Path Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Path Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{profileStats.learningPathProgression}%</span>
                  </div>
                  <Progress value={profileStats.learningPathProgression} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">You're making great progress on your learning journey!</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <achievement.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Sign out</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
