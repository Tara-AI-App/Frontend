"use client"

import { useEffect, useState, Suspense } from "react"
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
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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

  const type = searchParams.get("type") || "course"
  const topic = searchParams.get("topic") || "React Authentication"

  useEffect(() => {
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
            // Generation complete, redirect to content
            setTimeout(() => {
              const contentId = Math.random().toString(36).substr(2, 9)
              router.push(`/${type}/${contentId}?topic=${encodeURIComponent(topic)}`)
            }, 1000)
          }
        }, step.duration)
      }
    }

    processStep()
  }, [type, topic, router])

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
              Creating Your {type === "course" ? "Course" : "Guide"}
            </h2>
            <p className="text-muted-foreground mb-2 text-sm md:text-base font-medium">"{topic}"</p>
            <p className="text-xs md:text-sm text-muted-foreground px-4">
              Tara is analyzing your company's resources to create personalized content
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

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
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                  <Sparkles className="h-3 w-3" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-primary mb-1">AI Integration Active</p>
                  <p className="text-primary/70 text-xs md:text-sm">
                    Connected to internal repositories, Confluence documentation, and Slack channels for comprehensive
                    content generation based on Gojek's engineering practices.
                  </p>
                </div>
              </div>
            </div>

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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-5 w-5" />
                <span className="hidden sm:inline">Confluence</span>
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
