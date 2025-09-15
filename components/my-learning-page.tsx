"use client"

import { BookOpen, FileText, Clock, CheckCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Update learning items with more internal Gojek use cases
const learningItems = [
  {
    id: 1,
    title: "Real-time Recommendation API for Go-Food",
    type: "course",
    progress: 75,
    duration: "3h 15m",
    modules: 8,
    completed: 6,
    status: "in-progress",
    lastAccessed: "2 hours ago",
  },
  {
    id: 2,
    title: "Microservices Deployment with Kubernetes",
    type: "guide",
    progress: 100,
    duration: "1h 20m",
    modules: 5,
    completed: 5,
    status: "completed",
    lastAccessed: "1 day ago",
  },
  {
    id: 3,
    title: "Event-Driven Architecture for Order Processing",
    type: "course",
    progress: 30,
    duration: "2h 45m",
    modules: 6,
    completed: 2,
    status: "in-progress",
    lastAccessed: "3 days ago",
  },
  {
    id: 4,
    title: "Payment Gateway Integration Best Practices",
    type: "guide",
    progress: 0,
    duration: "45m",
    modules: 4,
    completed: 0,
    status: "not-started",
    lastAccessed: "Never",
  },
  {
    id: 5,
    title: "High-Traffic Handling in Go-Ride Backend",
    type: "course",
    progress: 0,
    duration: "2h 30m",
    modules: 7,
    completed: 0,
    status: "not-started",
    lastAccessed: "Just created",
  },
  {
    id: 6,
    title: "A/B Testing Implementation for Mobile Apps",
    type: "guide",
    progress: 0,
    duration: "55m",
    modules: 4,
    completed: 0,
    status: "not-started",
    lastAccessed: "Just created",
  },
]

export function MyLearningPage() {
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

          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {learningItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === "course" ? (
                        <BookOpen className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    {item.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <CardTitle className="text-base md:text-lg leading-tight">{item.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {item.completed}/{item.modules} modules
                      </span>
                      <span>{item.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">Last accessed: {item.lastAccessed}</span>
                  </div>

                  <Button
                    className="w-full text-sm"
                    size="sm"
                    variant={item.status === "completed" ? "outline" : "default"}
                    onClick={() => {
                      if (item.type === "course") {
                        window.location.href = `/course/${item.id}?topic=${encodeURIComponent(item.title)}`
                      } else {
                        window.location.href = `/guide/${item.id}?topic=${encodeURIComponent(item.title)}`
                      }
                    }}
                  >
                    {item.status === "completed" ? (
                      "Review"
                    ) : item.status === "not-started" ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
