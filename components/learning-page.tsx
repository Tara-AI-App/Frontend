"use client"

import { useEffect, useState } from "react"
import { BookOpen, Clock, CheckCircle, Play, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiService, CourseListItem } from "@/lib/api"
import { GuideListSection } from "@/components/guide-list-section"
import { useAuth } from "@/contexts/AuthContext"

function LearningPageComponent() {
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    // Only run on client side and when authentication is loaded
    if (typeof window === 'undefined' || authLoading) {
      return
    }

    // Don't fetch if user is not authenticated
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiService.getCourses()
        setCourses(response?.courses || [])
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [isAuthenticated, authLoading])

  const formatDuration = (hours?: number) => {
    if (!hours) return "Duration not specified"
    if (hours >= 1) {
      const wholeHours = Math.floor(hours)
      const remainingMinutes = Math.round((hours - wholeHours) * 60)
      if (remainingMinutes > 0) {
        return `${wholeHours}h ${remainingMinutes}m`
      }
      return `${wholeHours}h`
    }
    return `${hours.toFixed(1)}h`
  }

  const getStatusBadge = (course: CourseListItem) => {
    if (course.is_completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    } else if (course.progress > 0) {
      return <Badge variant="secondary">In Progress</Badge>
    } else {
      return null
    }
  }

  const getDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null
    
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800", 
      advanced: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge variant="secondary" className={colors[difficulty.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {difficulty}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="p-3 md:p-6">
          <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Your Learning Journey</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Loading your courses...
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={`skeleton-card-${i}`} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="p-3 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You need to be authenticated to access your learning content
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="p-3 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to Load Courses</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-3 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Your Learning Journey</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Continue where you left off or explore new topics
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Sort
              </Button>
            </div>
          </div>

          {/* Courses Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Your Courses ({courses.length})</h3>
            </div>
            
            {courses.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">No courses available yet</p>
                    <p className="text-xs text-muted-foreground">
                      Generate your first course to get started with learning
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {getStatusBadge(course)}
                        </div>
                        {course.is_completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </div>
                      <CardTitle className="text-base md:text-lg leading-tight">{course.title}</CardTitle>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {getDifficultyBadge(course.difficulty)}
                        {course.learning_objectives && course.learning_objectives.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {course.learning_objectives.length} objectives
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(course.progress)}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatDuration(course.estimated_duration)}</span>
                          <span>
                            {course.is_completed ? "Completed" : "In Progress"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="truncate">
                          Updated: {new Date(course.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      <Button
                        className="w-full text-sm"
                        size="sm"
                        variant={course.is_completed ? "outline" : "default"}
                        onClick={() => {
                          window.location.href = `/course/${course.id}`
                        }}
                      >
                        {(() => {
                          if (course.is_completed) {
                            return "Review"
                          }
                          if (course.progress === 0) {
                            return (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </>
                            )
                          }
                          return "Continue"
                        })()}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Guides Section */}
          <GuideListSection />
        </div>
      </div>
    </div>
  )
}

export default LearningPageComponent
