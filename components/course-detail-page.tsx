"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, CheckCircle, Clock, Users, ChevronRight, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { CourseChatbot } from "@/components/course-chatbot"
import { QuizComponent } from "@/components/quiz-component"
import { apiService, CourseDetail } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLocale } from "@/contexts/LocaleContext"
import { translateCourse } from "@/lib/translation-service"

interface CourseDetailPageProps {
  readonly courseId: string
}

export function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { locale, t } = useLocale()
  const [originalCourse, setOriginalCourse] = useState<CourseDetail | null>(null)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState(0)
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null)
  const [isLearningMode, setIsLearningMode] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  const [lessonCompletionLoading, setLessonCompletionLoading] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // Don't fetch course data if still checking authentication
    if (authLoading) {
      return
    }

    // Don't fetch course data if not authenticated
    if (!isAuthenticated) {
      setLoading(false)
      setError("Authentication required to access course content")
      return
    }

    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)

        const courseData = await apiService.getCourseById(courseId)
        setOriginalCourse(courseData)
        setCourse(courseData)
      } catch (err) {
        console.error("Failed to fetch course:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch course")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, isAuthenticated, authLoading])

  // Auto-translate when locale changes
  useEffect(() => {
    if (!originalCourse || translating) return

    const translateCourseContent = async () => {
      try {
        setTranslating(true)
        const translatedCourse = await translateCourse(originalCourse, locale)
        setCourse(translatedCourse)
      } catch (err) {
        console.error("Failed to translate course:", err)
        // If translation fails, fall back to original
        setCourse(originalCourse)
      } finally {
        setTranslating(false)
      }
    }

    translateCourseContent()
  }, [locale, originalCourse])

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
      return <Badge variant="default" className="bg-green-100 text-green-800">{t("course.completed")}</Badge>
    } else if (course.progress > 0) {
      return <Badge variant="secondary">{t("course.inProgress")}</Badge>
    } else {
      return null
    }
  }

  const calculateModuleProgress = (module: CourseDetail['modules'][0]) => {
    const completedLessons = module.lessons?.filter((lesson: any) => lesson.is_completed).length || 0
    const completedQuizzes = module.quizzes?.filter((quiz: any) => quiz.is_completed).length || 0
    const totalItems = (module.lessons?.length || 0) + (module.quizzes?.length || 0)
    const completedItems = completedLessons + completedQuizzes
    
    return `${completedItems}/${totalItems}`
  }

  const getCleanModuleTitle = (title: string) => {
    // Remove "Module X:" prefix if it exists
    return title.replace(/^Module\s+\d+:\s*/, '')
  }

  const getModuleNumber = (title: string, fallbackIndex: number) => {
    // Extract module number from title like "Module 1: Title"
    const regex = /^Module\s+(\d+):/
    const match = regex.exec(title)
    return match ? match[1] : (fallbackIndex + 1).toString()
  }

  const handleLessonClick = (moduleIndex: number, lessonIndex: number) => {
    setSelectedModule(moduleIndex)
    setSelectedLesson(lessonIndex)
    setSelectedQuiz(null)
    setIsLearningMode(true)
  }

  const handleQuizClick = (moduleIndex: number, quizIndex: number) => {
    setSelectedModule(moduleIndex)
    setSelectedQuiz(quizIndex)
    setSelectedLesson(null)
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


  const getCurrentLesson = () => {
    if (!course || selectedModule >= course.modules.length) return null
    const module = course.modules[selectedModule]
    if (selectedLesson === null || selectedLesson >= module.lessons.length) return null
    return module.lessons[selectedLesson]
  }

  const getCurrentQuiz = () => {
    if (!course || selectedModule >= course.modules.length) return null
    const module = course.modules[selectedModule]
    if (selectedQuiz === null || selectedQuiz >= module.quizzes.length) return null
    return module.quizzes[selectedQuiz]
  }

  const reloadCourseDetails = async () => {
    try {
      const courseData = await apiService.getCourseById(courseId)
      setCourse(courseData)
      return courseData
    } catch (error) {
      console.error("Failed to reload course details:", error)
      return null
    }
  }

  const findNextUnfinishedQuiz = (courseData: CourseDetail | null) => {
    if (!courseData) return null
    
    // Look for unfinished quizzes in order
    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
      const module = courseData.modules[moduleIndex]
      if (module.quizzes && module.quizzes.length > 0) {
        for (let quizIndex = 0; quizIndex < module.quizzes.length; quizIndex++) {
          const quiz = module.quizzes[quizIndex]
          if (!quiz.is_completed) {
            return { moduleIndex, quizIndex, quiz }
          }
        }
      }
    }
    return null
  }

  const handleLessonCompletion = async (lessonId: string, isCompleted: boolean) => {
    if (!course) return
    
    setLessonCompletionLoading(prev => new Set(prev).add(lessonId))
    
    try {
      const response = await apiService.completeLesson(lessonId, isCompleted)
      
      if (response.success) {
        // Update the lesson completion status in the course state
        setCourse(prevCourse => {
          if (!prevCourse) return null
          
          const updatedModules = prevCourse.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === lessonId 
                ? { ...lesson, is_completed: response.is_completed }
                : lesson
            )
          }))
          
          return {
            ...prevCourse,
            modules: updatedModules
          }
        })
      }
    } catch (error) {
      console.error("Failed to update lesson completion:", error)
      // You might want to add a toast notification here
    } finally {
      setLessonCompletionLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(lessonId)
        return newSet
      })
    }
  }

  const renderMainContent = () => {
    if (currentLesson) {
      const isLoading = lessonCompletionLoading.has(currentLesson.id)
      
      return (
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
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={() => handleLessonCompletion(currentLesson.id, !currentLesson.is_completed)}
                disabled={isLoading}
                variant={currentLesson.is_completed ? "outline" : "default"}
                className={currentLesson.is_completed ? "" : "bg-green-600 hover:bg-green-700 text-white"}
              >
                {isLoading ? (
                  "Updating..."
                ) : currentLesson.is_completed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Lesson
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    if (currentQuiz) {
      return (
        <QuizComponent 
          quiz={currentQuiz} 
          onQuizComplete={async (quizId, isCorrect) => {
            console.log(`Quiz ${quizId} completed: ${isCorrect ? 'passed' : 'failed'}`)
            
            // Reload course details to get updated quiz status
            const updatedCourse = await reloadCourseDetails()
            
            if (updatedCourse) {
              // Check if all quizzes in current module are completed
              const currentModule = updatedCourse.modules[selectedModule]
              const allCurrentModuleQuizzesCompleted = currentModule.quizzes?.every((quiz: any) => quiz.is_completed)
              
              if (allCurrentModuleQuizzesCompleted && currentModule.quizzes && currentModule.quizzes.length > 0) {
                // All quizzes in current module completed, go back to modules list
                setIsLearningMode(false)
                setSelectedQuiz(null)
                setSelectedLesson(null)
              } else {
                // Find the next unfinished quiz in the same module first
                const nextQuizInCurrentModule = currentModule.quizzes?.find((quiz: any) => !quiz.is_completed)
                if (nextQuizInCurrentModule) {
                  const quizIndex = currentModule.quizzes.findIndex((quiz: any) => quiz.id === nextQuizInCurrentModule.id)
                  setSelectedQuiz(quizIndex)
                  setIsLearningMode(true)
                } else {
                  // Find the next unfinished quiz across all modules
                  const nextQuiz = findNextUnfinishedQuiz(updatedCourse)
                  
                  if (nextQuiz) {
                    // Navigate to the next unfinished quiz
                    setSelectedModule(nextQuiz.moduleIndex)
                    setSelectedQuiz(nextQuiz.quizIndex)
                    setSelectedLesson(null)
                    setIsLearningMode(true)
                  } else {
                    // No more unfinished quizzes, go back to course overview
                    setIsLearningMode(false)
                    setSelectedQuiz(null)
                    setSelectedLesson(null)
                    alert('Congratulations! You have completed all quizzes in this course.')
                  }
                }
              }
            }
          }}
        />
      )
    }
    
    return null
  }

  // Show loading state while checking authentication or fetching course
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">
                  {authLoading ? "Checking Authentication" : "Loading Course"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {authLoading ? "Please wait while we verify your access..." : "Please wait while we fetch the course details..."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You need to be logged in to access course content.
                </p>
                <Button 
                  onClick={() => router.push('/login')} 
                  variant="default"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
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
  const currentQuiz = getCurrentQuiz()

  if (isLearningMode && (currentLesson || currentQuiz)) {
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
                    {course.modules.reduce((total, module) => total + (module.quizzes?.length || 0), 0) > 0 && (
                      <span>, {course.modules.reduce((total, module) => total + (module.quizzes?.length || 0), 0)} quiz{course.modules.reduce((total, module) => total + (module.quizzes?.length || 0), 0) > 1 ? 'zes' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {renderMainContent()}
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
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-semibold">
                                    Module {getModuleNumber(module.title, moduleIndex)}
                                  </span>
                                  {module.is_completed ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-gray-500">{calculateModuleProgress(module)} completed</span>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                              <h4 className="font-medium text-sm mt-1 text-gray-700">{getCleanModuleTitle(module.title)}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {module.lessons.length} lessons
                                {module.quizzes && module.quizzes.length > 0 && (
                                  <span>, {module.quizzes.length} quiz{module.quizzes.length > 1 ? 'zes' : ''}</span>
                                )}
                              </p>
                            </div>
                          </div>
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
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                    lesson.is_completed 
                                      ? 'bg-green-100 border border-green-500' 
                                      : 'bg-gray-100 border border-gray-300'
                                  }`}>
                                    {lesson.is_completed ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <span className="text-xs font-medium text-gray-600">
                                        {lesson.index}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-sm ${lesson.is_completed ? 'text-green-800 font-medium' : ''}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                              </button>
                            ))}
                            
                            {/* Quiz Section */}
                            {module.quizzes && module.quizzes.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wide">Quizzes</div>
                                {module.quizzes.map((quiz, quizIndex) => (
                                  <button
                                    key={quiz.id}
                                    onClick={() => handleQuizClick(moduleIndex, quizIndex)}
                                    className={`w-full text-left p-2 rounded cursor-pointer transition-colors border border-blue-200 bg-blue-50/30 ${
                                      selectedQuiz === quizIndex
                                        ? 'bg-blue-100 border-blue-300'
                                        : 'hover:bg-blue-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                        quiz.is_completed 
                                          ? 'bg-green-100 border border-green-500' 
                                          : 'bg-blue-100 border border-blue-300'
                                      }`}>
                                        {quiz.is_completed ? (
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <span className="text-xs font-medium text-blue-700">
                                            Q{quizIndex + 1}
                                          </span>
                                        )}
                                      </div>
                                      <span className={`text-sm ${quiz.is_completed ? 'text-green-800 font-medium' : 'text-blue-800'}`}>
                                        Quiz {quizIndex + 1}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Course AI Chat */}
          <CourseChatbot 
            courseId={courseId} 
            courseTitle={course?.title} 
            context="course" 
          />
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
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{module.title}</h3>
                              {module.is_completed ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {calculateModuleProgress(module)} completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {module.lessons.length} lessons
                              {module.quizzes && module.quizzes.length > 0 && (
                                <span>, {module.quizzes.length} quiz{module.quizzes.length > 1 ? 'zes' : ''}</span>
                              )}
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
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    lesson.is_completed 
                                      ? 'bg-green-100 border-2 border-green-500' 
                                      : 'bg-gray-100 border-2 border-gray-300'
                                  }`}>
                                    {lesson.is_completed ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <span className="text-sm font-medium text-gray-600">
                                        {lesson.index}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className={`font-medium ${lesson.is_completed ? 'text-green-800' : ''}`}>
                                      {lesson.title}
                                    </h4>
                                  </div>
                                </div>
                                {lesson.is_completed && (
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    Complete
                                  </Badge>
                                )}
                              </div>
                            </button>
                          ))}
                          
                          {/* Quiz Section */}
                          {module.quizzes && module.quizzes.length > 0 && (
                            <div className="bg-blue-50 border-t">
                              <div className="px-4 py-2 text-sm font-medium text-blue-700 border-b border-blue-200">
                                Quizzes
                              </div>
                              {module.quizzes.map((quiz, quizIndex) => (
                                <button
                                  key={quiz.id}
                                  className="w-full text-left p-4 border-b last:border-b-0 hover:bg-blue-100 transition-colors"
                                  onClick={() => handleQuizClick(moduleIndex, quizIndex)}
                                >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          quiz.is_completed 
                                            ? 'bg-green-100 border-2 border-green-500' 
                                            : 'bg-blue-100 border-2 border-blue-300'
                                        }`}>
                                          {quiz.is_completed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <span className="text-sm font-medium text-blue-700">
                                              Q{quizIndex + 1}
                                            </span>
                                          )}
                                        </div>
                                        <div>
                                          <h4 className={`font-medium ${quiz.is_completed ? 'text-green-800' : 'text-blue-800'}`}>
                                            Quiz {quizIndex + 1}
                                          </h4>
                                        </div>
                                      </div>
                                      {quiz.is_completed && (
                                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                          Complete
                                        </Badge>
                                      )}
                                    </div>
                                </button>
                              ))}
                            </div>
                          )}
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
                  <span className="font-medium text-right max-w-[60%] break-words">
                    {course.source_from && course.source_from.length > 0 
                      ? course.source_from.join(', ') 
                      : 'Internal Docs'}
                  </span>
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

        {/* Course AI Chat */}
        <CourseChatbot 
          courseId={courseId} 
          courseTitle={course?.title} 
          context="course" 
        />
      </div>
    </div>
  )
}
