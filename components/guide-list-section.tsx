"use client"

import { useEffect, useState } from "react"
import { FileText, Clock, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService, GuideListItem } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export function GuideListSection() {
  const [guides, setGuides] = useState<GuideListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
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

    const fetchGuides = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiService.getGuides()
        setGuides(response?.guides || [])
      } catch (err) {
        console.error("Failed to fetch guides:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch guides")
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [isAuthenticated, authLoading])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return "Unknown date"
    }
  }

  const handleGuideClick = (guideId: string) => {
    router.push(`/guide/${guideId}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Your Guides</h3>
        </div>
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Your Guides</h3>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Please log in to view your guides</p>
              <p className="text-xs text-muted-foreground">
                You need to be authenticated to access your learning content
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Your Guides</h3>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Failed to load guides</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (guides.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Your Guides</h3>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No guides available yet</p>
              <p className="text-xs text-muted-foreground">
                Generate your first guide to get started with learning
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Your Guides ({guides.length})</h3>
      </div>
      
      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {guides.map((guide) => (
          <Card 
            key={guide.id} 
            className="group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleGuideClick(guide.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {guide.title}
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Created {formatDate(guide.created_at)}</span>
              </div>
            </CardHeader>
            <CardContent>
              {guide.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {guide.description}
                </p>
              )}
              {guide.source_from && guide.source_from.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {guide.source_from.length} source{guide.source_from.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
