"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Play, CheckCircle, Clock, Users, ChevronRight, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { TaraChatbot } from "@/components/tara-chatbot"
import { apiService, CourseDetail } from "@/lib/api"

interface CourseDetailPageProps {
  courseId: string
}

export function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState(0)
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [isLearningMode, setIsLearningMode] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const courseData = await apiService.getCourseById(courseId)
        setCourse(courseData)
      } catch (err) {
        console.error("Failed to fetch course:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch course")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

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

  const getStatusBadge = (course: CourseDetail) => {
    if (course.is_completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    } else if (course.progress > 0) {
      return <Badge variant="secondary">In Progress</Badge>
    } else {
      return <Badge variant="outline">Not Started</Badge>
    }
  }

  const handleLessonClick = (moduleIndex: number, lessonIndex: number) => {
    setSelectedModule(moduleIndex)
    setSelectedLesson(lessonIndex)
    setIsLearningMode(true)
  }

  const toggleModuleExpansion = (moduleIndex: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex)
    } else {
      newExpanded.add(moduleIndex)
    }
    setExpandedModules(newExpanded)
  }

  const handleStartCourse = () => {
    setIsLearningMode(false)
    setExpandedModules(new Set([0]))
    setSelectedModule(0)
    setSelectedLesson(null)
  }

  const getCurrentLesson = () => {
    if (!course || selectedModule >= course.modules.length) return null
    const module = course.modules[selectedModule]
    if (selectedLesson === null || selectedLesson >= module.lessons.length) return null
    return module.lessons[selectedLesson]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Course</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => router.push('/learning')} 
                    variant="default"
                  >
                    Back to Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The course you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button 
                  onClick={() => router.push('/learning')} 
                  variant="default"
                >
                  Back to Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentLesson = getCurrentLesson()

  if (isLearningMode && currentLesson) {
    // Learning mode - show lesson content
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setIsLearningMode(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course Overview
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {getStatusBadge(course)}
                  {getDifficultyBadge(course.difficulty)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                {course.description && (
                  <p className="text-gray-600 text-lg mb-4">{course.description}</p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(course.estimated_duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.modules.length} modules
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{currentLesson.title}</CardTitle>
                    <Badge variant="outline">
                      Lesson {currentLesson.index}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <MarkdownRenderer content={currentLesson.content} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(course.progress)}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Course Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedModule(moduleIndex)
                            setSelectedLesson(null)
                          }}
                          className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedModule === moduleIndex
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                  Module {module.order_index}
                                </span>
                                {module.is_completed && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <h4 className="font-medium text-sm mt-1">{module.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {module.lessons.length} lessons
                          </p>
                        </button>
                        
                        {selectedModule === moduleIndex && (
                          <div className="ml-4 space-y-1">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonClick(moduleIndex, lessonIndex)}
                                className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${
                                  selectedLesson === lessonIndex
                                    ? 'bg-primary/5 border border-primary/10'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">
                                      {lesson.index}
                                    </span>
                                    {lesson.is_completed && (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    )}
                                  </div>
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tara Chatbot */}
          <div className="mt-8">
            <TaraChatbot />
          </div>
        </div>
      </div>
    )
  }

  // Course overview mode - show the layout from the image
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/learning')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Generated by Tara AI
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              {course.description && (
                <p className="text-gray-600 text-lg mb-4">{course.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.estimated_duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.modules.length} modules, {course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons
                </div>
                <div className="flex items-center gap-1">
                  {getDifficultyBadge(course.difficulty)}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleStartCourse}
                  className="px-6"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Course
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  Add to Learning Path
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleModuleExpansion(moduleIndex)}
                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {module.lessons.length} lessons
                            </p>
                          </div>
                          <ChevronRight 
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedModules.has(moduleIndex) ? 'rotate-90' : ''
                            }`} 
                          />
                        </div>
                      </button>
                      
                      {expandedModules.has(moduleIndex) && (
                        <div className="border-t bg-gray-50">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson.id}
                              className="w-full text-left p-4 border-b last:border-b-0 hover:bg-white transition-colors"
                              onClick={() => handleLessonClick(moduleIndex, lessonIndex)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {lesson.index}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{lesson.title}</h4>
                                  </div>
                                </div>
                                {lesson.is_completed && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{Math.round(course.progress)}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    Start learning to track your progress
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">{course.difficulty || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(course.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Generated From:</span>
                  <span className="font-medium">Internal Docs</span>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                {course.learning_objectives && course.learning_objectives.length > 0 ? (
                  <ul className="space-y-2">
                    {course.learning_objectives.map((objective, index) => (
                      <li key={`objective-${objective}-${index}`} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No learning objectives specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tara Chatbot */}
        <div className="mt-8">
          <TaraChatbot />
        </div>
      </div>
    </div>
  )
}
