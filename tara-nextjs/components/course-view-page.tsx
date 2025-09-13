"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BookOpen, Play, CheckCircle, Clock, Users, Star, ChevronRight, ArrowLeft, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { TaraChatbot } from "@/components/tara-chatbot"

interface CourseViewPageProps {
  courseId: string
}

function CourseViewContent({ courseId }: CourseViewPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const topic = searchParams.get("topic") || "Real-time Recommendation API for Go-Food"

  const [selectedModule, setSelectedModule] = useState(0)
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)

  // Mock course data with internal Gojek use cases - expanded with multiple chapters
  const mockCourses = {
    "1": {
      title: "Real-time Recommendation API for Go-Food Merchant Homepage",
      description:
        "Learn how to build and scale real-time recommendation systems specifically for the Go-Food Merchant app homepage, handling millions of restaurant and menu recommendations per day with personalized content delivery.",
      duration: "4h 45m",
      modules: 6,
      lessons: 32,
      difficulty: "Advanced",
      rating: 4.9,
      enrolledUsers: 234,
      lastUpdated: "2 hours ago",
      progress: 0,
      modules_data: [
        {
          id: 1,
          title: "Architecture Overview & System Design",
          duration: "45 min",
          lessons: 6,
          completed: false,
          lessons_data: [
            {
              id: 1,
              title: "Go-Food Merchant Homepage Recommendation Architecture",
              duration: "8 min",
              completed: false,
              content: `# Go-Food Merchant Homepage Recommendation Architecture

## Overview
The Go-Food Merchant app homepage serves **2.5 million merchants** across Southeast Asia with personalized recommendations for menu optimization, promotional strategies, and customer engagement insights.

## System Components

### 1. Data Pipeline Architecture
- **Real-time Event Streaming**: Apache Kafka processes merchant interactions, order patterns, and customer feedback
- **Feature Store**: Redis-based feature storage for low-latency merchant profile access
- **ML Model Serving**: TensorFlow Serving for real-time recommendation inference
- **Data Lake**: S3-based storage for historical merchant performance data

### 2. Core Recommendation Services
\`\`\`go
type MerchantRecommendationService struct {
    featureStore     FeatureStore
    modelClient      ModelClient
    cacheLayer       CacheLayer
    eventPublisher   EventPublisher
    merchantProfile  MerchantProfileService
}

func (mrs *MerchantRecommendationService) GetHomepageRecommendations(
    ctx context.Context, 
    merchantID string, 
    location Location,
) (*HomepageRecommendationResponse, error) {
    // Fetch merchant features
    merchantFeatures, err := mrs.featureStore.GetMerchantFeatures(ctx, merchantID)
    if err != nil {
        return nil, fmt.Errorf("failed to get merchant features: %w", err)
    }
    
    // Get contextual features (time, location, market trends)
    contextFeatures := mrs.buildContextFeatures(location, time.Now())
    
    // Get competitor analysis data
    competitorData, err := mrs.getCompetitorInsights(ctx, merchantID, location)
    if err != nil {
        log.Warn("Failed to get competitor data, using fallback", "error", err)
    }
    
    // Call ML model for recommendations
    recommendations, err := mrs.modelClient.PredictHomepageContent(
        ctx, 
        merchantFeatures, 
        contextFeatures,
        competitorData,
    )
    if err != nil {
        return nil, fmt.Errorf("model prediction failed: %w", err)
    }
    
    return recommendations, nil
}
\`\`\`

### 3. Homepage Content Types
The system generates recommendations for:
- **Menu Optimization**: Suggest popular items to highlight
- **Pricing Strategies**: Dynamic pricing recommendations
- **Promotional Content**: Targeted discount suggestions
- **Operational Insights**: Peak hours, delivery optimization
- **Customer Engagement**: Review response strategies

### 4. Performance Metrics
- **Latency**: P99 < 150ms for homepage load
- **Throughput**: 15,000+ RPS during peak hours
- **Availability**: 99.99% uptime SLA
- **Accuracy**: 85%+ recommendation relevance score

## Key Challenges Solved
1. **Merchant Diversity**: Different restaurant types, cuisines, and business models
2. **Real-time Market Data**: Competitor pricing, demand fluctuations
3. **Seasonal Variations**: Holiday patterns, weather impact
4. **Geographic Relevance**: Local preferences and regulations
5. **Business Impact**: Direct correlation with merchant revenue

> **Impact**: This system has increased merchant engagement by 40% and average order value by 25% across the platform.`,
            },
            {
              id: 2,
              title: "Microservices Architecture Deep Dive",
              duration: "10 min",
              completed: false,
              content: `# Microservices Architecture for Merchant Recommendations

## Service Decomposition

### 1. Merchant Profile Service
\`\`\`go
type MerchantProfileService struct {
    db          *sql.DB
    cache       *redis.Client
    eventBus    EventBus
}

type MerchantProfile struct {
    ID              string    \`json:"id"\`
    BusinessType    string    \`json:"business_type"\`
    CuisineTypes    []string  \`json:"cuisine_types"\`
    AverageRating   float64   \`json:"average_rating"\`
    OrderVolume     int64     \`json:"order_volume"\`
    PeakHours       []int     \`json:"peak_hours"\`
    Location        Location  \`json:"location"\`
    SubscriptionTier string   \`json:"subscription_tier"\`
    LastActive      time.Time \`json:"last_active"\`
}

func (mps *MerchantProfileService) GetProfile(ctx context.Context, merchantID string) (*MerchantProfile, error) {
    // Try cache first
    if profile, err := mps.getFromCache(ctx, merchantID); err == nil {
        return profile, nil
    }
    
    // Fallback to database
    profile, err := mps.getFromDB(ctx, merchantID)
    if err != nil {
        return nil, err
    }
    
    // Update cache asynchronously
    go mps.updateCache(merchantID, profile)
    
    return profile, nil
}
\`\`\`

> **Best Practice**: Each service maintains its own database and communicates through well-defined APIs and events.`,
            },
          ],
        },
        {
          id: 2,
          title: "Data Pipeline & Feature Engineering",
          duration: "55 min",
          lessons: 7,
          completed: false,
          lessons_data: [
            {
              id: 1,
              title: "Real-time Data Ingestion with Kafka",
              duration: "12 min",
              completed: false,
              content: `# Real-time Data Ingestion for Merchant Recommendations

## Kafka Architecture for Go-Food Merchant Data

### 1. Topic Design
\`\`\`yaml
topics:
  merchant-activities:
    partitions: 24
    replication-factor: 3
    retention: 7d
    
  order-events:
    partitions: 48
    replication-factor: 3
    retention: 30d
\`\`\`

### 2. Producer Implementation
\`\`\`go
type MerchantEventProducer struct {
    producer *kafka.Producer
    config   ProducerConfig
}

func (mep *MerchantEventProducer) PublishMerchantActivity(
    ctx context.Context,
    merchantID string,
    activityType string,
    data map[string]interface{},
) error {
    event := MerchantEvent{
        EventID:    generateEventID(),
        MerchantID: merchantID,
        EventType:  activityType,
        Timestamp:  time.Now(),
        Data:       data,
        Version:    "v1",
    }
    
    eventBytes, err := json.Marshal(event)
    if err != nil {
        return fmt.Errorf("failed to marshal event: %w", err)
    }
    
    return mep.producer.Produce(message, deliveryChan)
}
\`\`\`

> **Performance**: This pipeline processes 2M+ events per minute with sub-second latency for real-time recommendations.`,
            },
          ],
        },
      ],
    },
    "5": {
      title: "High-Traffic Handling in Go-Ride Backend",
      description:
        "Learn how to build scalable backend systems that can handle millions of ride requests like Go-Ride, including load balancing, caching, and database optimization strategies.",
      duration: "2h 30m",
      modules: 7,
      lessons: 32,
      difficulty: "Advanced",
      rating: 4.8,
      enrolledUsers: 189,
      lastUpdated: "Just created",
      progress: 0,
      modules_data: [
        {
          id: 1,
          title: "System Architecture for Scale",
          duration: "25 min",
          lessons: 4,
          completed: false,
          lessons_data: [
            {
              id: 1,
              title: "Go-Ride Architecture Overview",
              duration: "8 min",
              completed: false,
              content: `# Go-Ride High-Traffic Architecture

## System Scale
Go-Ride processes:
- **50M+ ride requests daily**
- **Peak traffic**: 100K concurrent users
- **Geographic coverage**: 200+ cities across SEA
- **Driver network**: 2M+ active drivers

## Core Architecture Components

### 1. API Gateway Layer
\`\`\`go
type APIGateway struct {
    rateLimiter   RateLimiter
    loadBalancer  LoadBalancer
    circuitBreaker CircuitBreaker
    authService   AuthService
}

func (gw *APIGateway) HandleRideRequest(ctx context.Context, req *RideRequest) (*RideResponse, error) {
    // Rate limiting
    if !gw.rateLimiter.Allow(req.UserID) {
        return nil, ErrRateLimitExceeded
    }
    
    // Circuit breaker protection
    return gw.circuitBreaker.Execute(func() (*RideResponse, error) {
        return gw.loadBalancer.Route(ctx, req)
    })
}
\`\`\`

### 2. Load Balancing Strategy
- **Geographic Distribution**: Route requests to nearest data center
- **Service Mesh**: Istio for intelligent traffic routing
- **Auto-scaling**: Kubernetes HPA based on CPU and custom metrics
- **Circuit Breakers**: Prevent cascade failures

### 3. Caching Architecture
- **Redis Cluster**: Distributed caching for hot data
- **CDN**: Static content delivery
- **Application Cache**: In-memory caching for frequently accessed data

> **Performance**: Handles 100K+ concurrent requests with P99 latency under 200ms.`,
            },
          ],
        },
      ],
    },
  }

  const courseData = mockCourses[courseId as keyof typeof mockCourses] || mockCourses["1"]

  const handleStartCourse = () => {
    // Show first lesson content
    setSelectedLesson(1)
  }

  const handleLessonClick = (moduleIndex: number, lessonId: number) => {
    setSelectedModule(moduleIndex)
    setSelectedLesson(lessonId)
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
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg md:text-xl font-semibold">Course</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row">
        {/* Course Content */}
        <div className="flex-1 p-3 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {selectedLesson ? (
              // Show lesson content
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedLesson(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Module {selectedModule + 1} • Lesson {selectedLesson}
                  </Badge>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <MarkdownRenderer
                    content={
                      courseData.modules_data[selectedModule]?.lessons_data.find((l) => l.id === selectedLesson)
                        ?.content || "Content not found"
                    }
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline">Previous Lesson</Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Next Lesson
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              // Show course overview
              <>
                {/* Course Header */}
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3">
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{courseData.title}</h1>
                      <p className="text-muted-foreground text-base md:text-lg max-w-4xl">{courseData.description}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 w-fit">Generated by Tara AI</Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {courseData.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {courseData.modules} modules, {courseData.lessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {courseData.enrolledUsers} enrolled
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {courseData.rating}
                    </div>
                    <Badge variant="secondary">{courseData.difficulty}</Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleStartCourse} className="bg-primary hover:bg-primary/90" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Start Course
                    </Button>
                    <Button variant="outline" size="lg">
                      Add to Learning Path
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Course Modules */}
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold">Course Content</h2>
                  <div className="space-y-3">
                    {courseData.modules_data.map((module, index) => (
                      <Card key={module.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedModule(selectedModule === index ? -1 : index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                {module.id}
                              </div>
                              <div>
                                <CardTitle className="text-base md:text-lg">{module.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {module.lessons} lessons • {module.duration}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              className={`h-5 w-5 transition-transform ${selectedModule === index ? "rotate-90" : ""}`}
                            />
                          </div>
                        </CardHeader>

                        {selectedModule === index && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {module.lessons_data.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                  onClick={() => handleLessonClick(index, lesson.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30">
                                      {lesson.completed ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Play className="h-3 w-3" />
                                      )}
                                    </div>
                                    <span className="font-medium text-sm md:text-base hover:text-primary transition-colors">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Course Sidebar */}
        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l bg-muted/20 p-3 md:p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{courseData.progress}%</span>
                  </div>
                  <Progress value={courseData.progress} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">Start learning to track your progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Difficulty</span>
                  <Badge variant="secondary">{courseData.difficulty}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span className="text-muted-foreground">{courseData.lastUpdated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Generated From</span>
                  <span className="text-muted-foreground">Internal Docs</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Build scalable real-time recommendation systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Implement ML model serving at scale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Design event-driven architectures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Optimize for high-traffic scenarios</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tara Chatbot */}
      <TaraChatbot context="course" />
    </div>
  )
}

function CourseViewFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
        <p>Loading course...</p>
      </div>
    </div>
  )
}

export function CourseViewPage({ courseId }: CourseViewPageProps) {
  return (
    <Suspense fallback={<CourseViewFallback />}>
      <CourseViewContent courseId={courseId} />
    </Suspense>
  )
}
