"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FileText, CheckCircle, Clock, ArrowLeft, Download, Share, Copy, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { CourseChatbot } from "@/components/course-chatbot"
import { apiService, GuideDetailResponse } from "@/lib/api"

interface GuideViewPageProps {
  guideId: string
}

function GuideViewContent({ guideId }: GuideViewPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [guideData, setGuideData] = useState<GuideDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true)
        setError(null)
        const guide = await apiService.getGuideById(guideId)
        setGuideData(guide)
      } catch (err) {
        console.error('Error fetching guide:', err)
        setError(err instanceof Error ? err.message : 'Failed to load guide')
      } finally {
        setLoading(false)
      }
    }

    if (guideId) {
      fetchGuide()
    }
  }, [guideId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
          <p>Loading guide...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Guide</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!guideData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Guide Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested guide could not be found.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    
    return formatDate(dateString)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="border-b p-3 md:p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg md:text-xl font-semibold">Guide</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row">
        {/* Guide Content */}
        <div className="flex-1 p-3 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Guide Header */}
            <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{guideData.title}</h1>
                {guideData.description && (
                  <p className="text-muted-foreground text-base md:text-lg max-w-4xl">{guideData.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTimeAgo(guideData.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Guide
                </div>
                {guideData.source_from && guideData.source_from.length > 0 && (
                  <Badge variant="secondary">{guideData.source_from.length} sources</Badge>
                )}
              </div>

            </div>

            <Separator />

            {/* Guide Content */}
            <div className="space-y-6">
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <MarkdownRenderer content={guideData.content} />
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>

        {/* Guide Sidebar */}
        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l bg-muted/20 p-3 md:p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guide Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Created</span>
                  <span className="text-muted-foreground">{formatDate(guideData.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span className="text-muted-foreground">{formatDate(guideData.updated_at)}</span>
                </div>
                {guideData.source_from && guideData.source_from.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Generated From:</span>
                    <div className="space-y-1">
                      {guideData.source_from.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Guide AI Chat */}
      <CourseChatbot 
        guideId={guideId} 
        guideTitle={guideData?.title} 
        context="guide" 
      />
    </div>
  )
}

function GuideViewFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <FileText className="h-8 w-8 text-primary mx-auto mb-4" />
        <p>Loading guide...</p>
      </div>
    </div>
  )
}

export function GuideViewPage({ guideId }: GuideViewPageProps) {
  return (
    <Suspense fallback={<GuideViewFallback />}>
      <GuideViewContent guideId={guideId} />
    </Suspense>
  )
}
