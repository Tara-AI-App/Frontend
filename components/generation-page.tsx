"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Sparkles,
  CheckCircle,
  Loader2,
  BookOpen,
  FileText,
  Code,
  Database,
  Globe,
  Github,
  HardDrive,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { apiService, OAuthTokenResponse } from "@/lib/api"

const generationSteps = [
  { id: 1, title: "Analyzing company codebase", icon: Code, duration: 2000 },
  { id: 2, title: "Reviewing documentation", icon: FileText, duration: 1500 },
  { id: 3, title: "Searching internal knowledge base", icon: Database, duration: 1800 },
  { id: 4, title: "Gathering web resources", icon: Globe, duration: 1200 },
  { id: 5, title: "Generating content structure", icon: Sparkles, duration: 2500 },
  { id: 6, title: "Creating interactive elements", icon: BookOpen, duration: 2000 },
]

function GenerationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedCourseId, setGeneratedCourseId] = useState<string | null>(null)
  const [generatedGuideId, setGeneratedGuideId] = useState<string | null>(null)
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false)
  const [oauthTokens, setOauthTokens] = useState<OAuthTokenResponse[]>([])
  const [tokensLoaded, setTokensLoaded] = useState(false)
  const generationInitiatedRef = useRef(false)
  const apiCallCountRef = useRef(0)
  const componentMountCountRef = useRef(0)

  const type = searchParams.get("type") || "course"
  const topic = decodeURIComponent(searchParams.get("topic") || "React Authentication")
  const filesParam = searchParams.get("files") || ""

  // Fetch OAuth tokens when component mounts
  useEffect(() => {
    const fetchOAuthTokens = async () => {
      try {
        const response = await apiService.getOAuthTokens(['github', 'drive'])
        setOauthTokens(response.tokens)
        setTokensLoaded(true)
      } catch (error) {
        console.error('Failed to fetch OAuth tokens:', error)
        setOauthTokens([])
        setTokensLoaded(true)
      }
    }

    fetchOAuthTokens()
    
    // Fallback timeout to ensure tokensLoaded is set even if API fails
    const timeout = setTimeout(() => {
      if (!tokensLoaded) {
        console.warn('OAuth token fetch timed out, proceeding without tokens')
        setTokensLoaded(true)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [])

  const generateCourse = useCallback(async () => {
    // Multiple layers of protection against duplicate calls
    if (isGenerating || generatedCourseId || generationInitiatedRef.current) {
      console.log("🚫 Course generation blocked - already in progress or completed")
      return
    }
    
    // Wait for tokens to be loaded
    if (!tokensLoaded) {
      console.log("⏳ Waiting for OAuth tokens to load...")
      return
    }
    
    console.log("🔑 OAuth tokens loaded:", oauthTokens.length, "tokens found")
    
    generationInitiatedRef.current = true
    apiCallCountRef.current += 1
    
    console.log(`🚀 Starting course generation (call #${apiCallCountRef.current})`)
    setIsGenerating(true)
    
    try {
      // Parse uploaded files if any
      let filesUrl: string | undefined
      if (filesParam) {
        try {
          const files = JSON.parse(decodeURIComponent(filesParam))
          filesUrl = files.map((f: any) => f.url || f.name).join(',')
        } catch (e) {
          console.warn("Failed to parse files parameter:", e)
        }
      }

      // Get tokens from the fetched OAuth tokens
      const githubToken = oauthTokens.find(token => token.provider === 'github')?.access_token || ""
      const driveToken = oauthTokens.find(token => token.provider === 'drive')?.access_token || ""

      console.log("📡 Calling AI course generation API...")
      console.log("🔑 Tokens:", { github: !!githubToken, drive: !!driveToken })
      
      // Call the AI course generation API
      const response = await apiService.generateCourse({
        token_github: githubToken,
        token_drive: driveToken || "no_drive_token", // Provide fallback to prevent 422 error
        prompt: topic, // topic is now properly decoded
        files_url: filesUrl
      })

      console.log("✅ Course generated successfully:", response.course_id)
      setGeneratedCourseId(response.course_id)
      
      // Redirect to course detail page after a short delay
      setTimeout(() => {
        console.log("🔄 Redirecting to course detail page...")
        router.push(`/course/${response.course_id}`)
      }, 1000)
      
    } catch (error) {
      console.error("❌ Failed to generate course:", error)
      let errorMessage = 'Unknown error occurred'
      
      if (error instanceof Error) {
        if (error.message.includes('Request timeout')) {
          errorMessage = 'Course generation is taking longer than expected. The AI service may be busy. Please try again in a few minutes.'
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
        } else if (error.message.includes('timed out')) {
          errorMessage = 'The AI service took too long to respond. This can happen with complex course generation. Please try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      // Don't reset generationInitiatedRef on error to prevent automatic retries
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, generatedCourseId, filesParam, topic, router, oauthTokens, tokensLoaded])

  const generateGuide = useCallback(async () => {
    // Multiple layers of protection against duplicate calls
    if (isGenerating || generatedGuideId || generationInitiatedRef.current) {
      console.log("🚫 Guide generation blocked - already in progress or completed")
      return
    }
    
    // Wait for tokens to be loaded
    if (!tokensLoaded) {
      console.log("⏳ Waiting for OAuth tokens to load...")
      return
    }
    
    console.log("🔑 OAuth tokens loaded:", oauthTokens.length, "tokens found")
    
    generationInitiatedRef.current = true
    apiCallCountRef.current += 1
    
    console.log(`🚀 Starting guide generation (call #${apiCallCountRef.current})`)
    setIsGenerating(true)
    
    try {
      // Parse uploaded files if any
      let filesUrl: string | undefined
      if (filesParam) {
        try {
          const files = JSON.parse(decodeURIComponent(filesParam))
          filesUrl = files.map((f: any) => f.url || f.name).join(',')
        } catch (e) {
          console.warn("Failed to parse files parameter:", e)
        }
      }

      // Get tokens from the fetched OAuth tokens
      const githubToken = oauthTokens.find(token => token.provider === 'github')?.access_token || ""
      const driveToken = oauthTokens.find(token => token.provider === 'drive')?.access_token || ""

      console.log("📡 Calling AI guide generation API...")
      console.log("🔑 Tokens:", { github: !!githubToken, drive: !!driveToken })
      
      // Call the AI guide generation API
      const response = await apiService.generateGuide({
        token_github: githubToken,
        token_drive: driveToken || "no_drive_token", // Provide fallback to prevent 422 error
        prompt: topic, // topic is now properly decoded
        files_url: filesUrl
      })

      console.log("✅ Guide generated successfully:", response.guide_id)
      setGeneratedGuideId(response.guide_id)
      
      // Redirect to guide detail page after a short delay
      setTimeout(() => {
        console.log("🔄 Redirecting to guide detail page...")
        router.push(`/guide/${response.guide_id}`)
      }, 1000)
      
    } catch (error) {
      console.error("❌ Failed to generate guide:", error)
      let errorMessage = 'Unknown error occurred'
      
      if (error instanceof Error) {
        if (error.message.includes('Request timeout')) {
          errorMessage = 'Guide generation is taking longer than expected. The AI service may be busy. Please try again in a few minutes.'
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
        } else if (error.message.includes('timed out')) {
          errorMessage = 'The AI service took too long to respond. This can happen with complex guide generation. Please try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      // Don't reset generationInitiatedRef on error to prevent automatic retries
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, generatedGuideId, filesParam, topic, router, oauthTokens, tokensLoaded])

  useEffect(() => {
    componentMountCountRef.current += 1
    console.log(`🔄 GenerationContent component mounted (mount #${componentMountCountRef.current})`)
    
    // Prevent multiple executions
    if (hasStartedGeneration) {
      console.log("🚫 Generation process already started, skipping...")
      return
    }
    
    console.log("🎬 Starting generation process...")
    setHasStartedGeneration(true)
    let stepIndex = 0
    let totalProgress = 0

    const processStep = () => {
      if (stepIndex < generationSteps.length) {
        setCurrentStep(stepIndex)

        const step = generationSteps[stepIndex]
        const stepProgress = ((stepIndex + 1) / generationSteps.length) * 100

        // Animate progress for current step
        const progressInterval = setInterval(() => {
          totalProgress += 2
          setProgress(Math.min(totalProgress, stepProgress))
        }, step.duration / 50)

        setTimeout(() => {
          clearInterval(progressInterval)
          setCompletedSteps((prev) => [...prev, stepIndex])
          setProgress(stepProgress)
          stepIndex++

          if (stepIndex < generationSteps.length) {
            setTimeout(processStep, 500)
          } else {
            // All steps completed, now generate the actual course if type is "course"
            if (type === "course") {
              console.log("📚 All visual steps completed, waiting for tokens to be ready...")
              // Don't call generateCourse here - let the useEffect handle it when tokens are ready
            } else {
              // For guides, wait for tokens to be ready and then generate
              console.log("📖 All visual steps completed for guide, waiting for tokens to be ready...")
            }
          }
        }, step.duration)
      }
    }

    processStep()
  }, [type, topic, router, hasStartedGeneration])

  // Separate useEffect to trigger generation when tokens are ready and visual steps are complete
  useEffect(() => {
    if (tokensLoaded && hasStartedGeneration && !isGenerating && !error) {
      // Check if all visual steps are completed (progress is 100%)
      if (progress >= 100) {
        if (type === "course" && !generatedCourseId) {
          console.log("🎯 All conditions met: tokens loaded, visual steps complete, calling generateCourse...")
          generateCourse()
        } else if (type === "guide" && !generatedGuideId) {
          console.log("🎯 All conditions met: tokens loaded, visual steps complete, calling generateGuide...")
          generateGuide()
        }
      }
    }
  }, [type, tokensLoaded, hasStartedGeneration, isGenerating, generatedCourseId, generatedGuideId, progress, error, generateCourse, generateGuide])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              {error ? "Generation Failed" : 
               (generatedCourseId || generatedGuideId) ? `${type === "course" ? "Course" : "Guide"} Generated!` : 
               isGenerating ? `Generating ${type === "course" ? "Course" : "Guide"}...` : 
               `Creating Your ${type === "course" ? "Course" : "Guide"}`}
            </h2>
            <p className="text-muted-foreground mb-2 text-sm md:text-base font-medium">"{topic}"</p>
            <p className="text-xs md:text-sm text-muted-foreground px-4">
              {error ? `There was an error generating your ${type}. Please try again.` : 
               (generatedCourseId || generatedGuideId) ? `Your ${type} has been successfully generated!` :
               isGenerating ? `Calling AI service to generate your ${type}...` :
               "Tara is analyzing your company's resources to create personalized content"}
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-1">Generation Failed</p>
                    <p className="text-red-700 text-xs md:text-sm">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{(generatedCourseId || generatedGuideId) ? "100%" : isGenerating ? "Generating..." : `${Math.round(progress)}%`}</span>
                </div>
                <Progress value={(generatedCourseId || generatedGuideId) ? 100 : progress} className="h-3" />
              </div>
            )}

            <div className="space-y-2 md:space-y-3">
              {generationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === currentStep
                      ? "bg-primary/10 border border-primary/20"
                      : completedSteps.includes(index)
                        ? "bg-green-50 border border-green-200"
                        : "bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      completedSteps.includes(index)
                        ? "bg-green-600 text-white"
                        : index === currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : index === currentStep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`font-medium text-sm md:text-base flex-1 ${
                      index === currentStep
                        ? "text-primary"
                        : completedSteps.includes(index)
                          ? "text-green-700"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index === currentStep && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
                </div>
              ))}
              
              {/* Show generation step for both course and guide */}
              {(type === "course" || type === "guide") && (
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isGenerating
                      ? "bg-primary/10 border border-primary/20"
                      : (generatedCourseId || generatedGuideId)
                        ? "bg-green-50 border border-green-200"
                        : error
                          ? "bg-red-50 border border-red-200"
                          : "bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      (generatedCourseId || generatedGuideId)
                        ? "bg-green-600 text-white"
                        : isGenerating
                          ? "bg-primary text-primary-foreground"
                          : error
                            ? "bg-red-600 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {(generatedCourseId || generatedGuideId) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : error ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`font-medium text-sm md:text-base flex-1 ${
                      isGenerating
                        ? "text-primary"
                        : (generatedCourseId || generatedGuideId)
                          ? "text-green-700"
                          : error
                            ? "text-red-700"
                            : "text-muted-foreground"
                    }`}
                  >
                    {(generatedCourseId || generatedGuideId) ? `${type === "course" ? "Course" : "Guide"} generated successfully!` : 
                     isGenerating ? `Generating ${type} with AI... (this may take up to 2 minutes)` :
                     error ? `${type === "course" ? "Course" : "Guide"} generation failed` :
                     `Ready to generate ${type}`}
                  </span>
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
                </div>
              )}
            </div>


            {/* Error Retry Button */}
            {error && !isGenerating && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => {
                    setError(null)
                    generationInitiatedRef.current = false
                    if (type === "course") {
                      generateCourse()
                    } else if (type === "guide") {
                      generateGuide()
                    }
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Integration Icons */}
            <div className="flex justify-center items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-5 w-5" />
                <span className="hidden sm:inline">Drive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GenerationFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 md:p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Loading Generation Page</h2>
            <p className="text-muted-foreground text-sm md:text-base">Please wait...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function GenerationPage() {
  return (
    <Suspense fallback={<GenerationFallback />}>
      <GenerationContent />
    </Suspense>
  )
}
