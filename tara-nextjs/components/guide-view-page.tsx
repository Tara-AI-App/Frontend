"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FileText, CheckCircle, Clock, ArrowLeft, Download, Share, Copy, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { TaraChatbot } from "@/components/tara-chatbot"

interface GuideViewPageProps {
  guideId: string
}

function GuideViewContent({ guideId }: GuideViewPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const topic = searchParams.get("topic") || "Microservices Deployment with Kubernetes"

  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Mock guide data with internal Gojek use cases
  const mockGuides = {
    "2": {
      title: "Microservices Deployment with Kubernetes at Gojek",
      description:
        "A comprehensive guide for deploying microservices using Gojek's Kubernetes infrastructure, including best practices for scaling, monitoring, and maintaining services across multiple regions.",
      estimatedTime: "1h 20m",
      difficulty: "Intermediate",
      lastUpdated: "2 hours ago",
      steps: [
        {
          id: 1,
          title: "Prepare Gojek Kubernetes Environment",
          description: "Set up access to Gojek's multi-region Kubernetes clusters and required tools",
          estimatedTime: "15 min",
          content: `# Prepare Gojek Kubernetes Environment

## Prerequisites
Before deploying to Gojek's Kubernetes infrastructure, ensure you have:

- **VPN Access**: Connected to Gojek's internal network
- **kubectl**: Version 1.24+ configured with cluster credentials
- **Docker**: Access to Gojek's internal container registry
- **Helm**: Version 3.8+ for package management
- **Istio CLI**: For service mesh configuration

## Environment Setup

### 1. Configure kubectl for Multi-Region Access
\`\`\`bash
# Set up contexts for different regions
kubectl config set-context gojek-sg --cluster=gojek-singapore --user=your-username
kubectl config set-context gojek-id --cluster=gojek-jakarta --user=your-username
kubectl config set-context gojek-th --cluster=gojek-bangkok --user=your-username

# Switch to primary region (Singapore)
kubectl config use-context gojek-sg

# Verify access
kubectl get nodes
kubectl get namespaces
\`\`\`

### 2. Access Container Registry
\`\`\`bash
# Login to Gojek's internal registry
docker login registry.gojek.io
Username: your-ldap-username
Password: your-access-token

# Verify access
docker pull registry.gojek.io/base-images/golang:1.19-alpine
\`\`\`

### 3. Set Environment Variables
\`\`\`bash
export GOJEK_NAMESPACE="your-team-namespace"
export SERVICE_NAME="your-service-name"
export REGION="singapore"
export ENVIRONMENT="staging" # or production
\`\`\`

## Gojek's Kubernetes Architecture

### Cluster Structure
- **Singapore (Primary)**: Production workloads, 500+ nodes
- **Jakarta (Secondary)**: Regional services, 300+ nodes  
- **Bangkok**: Disaster recovery, 100+ nodes

### Namespace Organization
\`\`\`yaml
namespaces:
  - gofood-backend      # Go-Food services
  - goride-backend      # Go-Ride services
  - gopay-backend       # GoPay services
  - shared-services     # Common utilities
  - monitoring          # Observability stack
  - istio-system        # Service mesh
\`\`\`

> **Important**: Always deploy to staging first, then promote to production after validation.`,
          resources: [
            { title: "Gojek K8s Access Guide", url: "#", type: "internal" },
            { title: "Container Registry Docs", url: "#", type: "internal" },
          ],
        },
      ],
    },
    "4": {
      title: "Payment Gateway Integration Best Practices",
      description:
        "Learn how to integrate with payment gateways securely and efficiently, following Gojek's GoPay integration patterns and industry best practices for handling financial transactions.",
      estimatedTime: "45m",
      difficulty: "Intermediate",
      lastUpdated: "Just created",
      progress: 0,
      steps: [
        {
          id: 1,
          title: "Payment Architecture Overview",
          description: "Understand Gojek's payment system architecture and security requirements",
          estimatedTime: "10 min",
          content: `# Payment Gateway Integration Architecture

## Gojek's Payment Ecosystem

### Core Components
- **GoPay Wallet**: Primary payment method for Gojek services
- **External Gateways**: Credit cards, bank transfers, e-wallets
- **Payment Orchestrator**: Routes payments to appropriate gateways
- **Fraud Detection**: Real-time transaction monitoring
- **Settlement Service**: Handles merchant payouts

### Security Requirements
All payment integrations must comply with:
- **PCI DSS Level 1** compliance
- **Bank Indonesia** regulations
- **ISO 27001** security standards
- **SOX** compliance for financial reporting

## Payment Flow Architecture

\`\`\`mermaid
graph TD
    A[User Initiates Payment] --> B[Payment Service]
    B --> C{Payment Method?}
    C -->|GoPay| D[GoPay Service]
    C -->|Card| E[Card Gateway]
    C -->|Bank Transfer| F[Bank Gateway]
    D --> G[Fraud Check]
    E --> G
    F --> G
    G --> H{Fraud Detected?}
    H -->|No| I[Process Payment]
    H -->|Yes| J[Block Transaction]
    I --> K[Update Order Status]
    I --> L[Send Notification]
\`\`\`

### Key Principles
1. **Never store sensitive data**: Use tokenization
2. **Idempotency**: All payment operations must be idempotent
3. **Async processing**: Handle payments asynchronously
4. **Comprehensive logging**: Audit all payment activities
5. **Circuit breakers**: Protect against gateway failures`,
          resources: [
            { title: "PCI DSS Compliance Guide", url: "#", type: "internal" },
            { title: "Payment Security Standards", url: "#", type: "internal" },
          ],
        },
        {
          id: 2,
          title: "Secure API Integration",
          description:
            "Implement secure communication with payment gateways using proper authentication and encryption",
          estimatedTime: "15 min",
          content: `# Secure Payment Gateway Integration

## Authentication Methods

### 1. API Key Authentication
\`\`\`go
type PaymentClient struct {
    apiKey    string
    secretKey string
    baseURL   string
    client    *http.Client
}

func (pc *PaymentClient) createAuthHeader(payload []byte) string {
    timestamp := time.Now().Unix()
    message := fmt.Sprintf("%s%d%s", pc.apiKey, timestamp, string(payload))
    
    h := hmac.New(sha256.New, []byte(pc.secretKey))
    h.Write([]byte(message))
    signature := hex.EncodeToString(h.Sum(nil))
    
    return fmt.Sprintf("HMAC-SHA256 %s:%d:%s", pc.apiKey, timestamp, signature)
}
\`\`\`

### 2. OAuth 2.0 Integration
\`\`\`go
type OAuthClient struct {
    clientID     string
    clientSecret string
    tokenURL     string
    accessToken  string
    expiresAt    time.Time
    mutex        sync.RWMutex
}

func (oc *OAuthClient) getAccessToken(ctx context.Context) (string, error) {
    oc.mutex.RLock()
    if time.Now().Before(oc.expiresAt) {
        token := oc.accessToken
        oc.mutex.RUnlock()
        return token, nil
    }
    oc.mutex.RUnlock()
    
    return oc.refreshToken(ctx)
}

func (oc *OAuthClient) refreshToken(ctx context.Context) (string, error) {
    oc.mutex.Lock()
    defer oc.mutex.Unlock()
    
    data := url.Values{}
    data.Set("grant_type", "client_credentials")
    data.Set("client_id", oc.clientID)
    data.Set("client_secret", oc.clientSecret)
    
    resp, err := http.PostForm(oc.tokenURL, data)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    
    var tokenResp struct {
        AccessToken string \`json:"access_token"\`
        ExpiresIn   int    \`json:"expires_in"\`
    }
    
    if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
        return "", err
    }
    
    oc.accessToken = tokenResp.AccessToken
    oc.expiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)
    
    return oc.accessToken, nil
}
\`\`\`

## Request/Response Handling

### Secure Request Builder
\`\`\`go
type PaymentRequest struct {
    Amount      int64  \`json:"amount"\`
    Currency    string \`json:"currency"\`
    OrderID     string \`json:"order_id"\`
    CustomerID  string \`json:"customer_id"\`
    Description string \`json:"description"\`
    CallbackURL string \`json:"callback_url"\`
}

func (pc *PaymentClient) CreatePayment(ctx context.Context, req PaymentRequest) (*PaymentResponse, error) {
    // Generate idempotency key
    idempotencyKey := generateIdempotencyKey(req.OrderID)
    
    payload, err := json.Marshal(req)
    if err != nil {
        return nil, fmt.Errorf("failed to marshal request: %w", err)
    }
    
    httpReq, err := http.NewRequestWithContext(ctx, "POST", pc.baseURL+"/payments", bytes.NewBuffer(payload))
    if err != nil {
        return nil, err
    }
    
    // Set security headers
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", pc.createAuthHeader(payload))
    httpReq.Header.Set("Idempotency-Key", idempotencyKey)
    httpReq.Header.Set("X-Request-ID", generateRequestID())
    
    resp, err := pc.client.Do(httpReq)
    if err != nil {
        return nil, fmt.Errorf("payment request failed: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, handleErrorResponse(resp)
    }
    
    var paymentResp PaymentResponse
    if err := json.NewDecoder(resp.Body).Decode(&paymentResp); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }
    
    return &paymentResp, nil
}
\`\`\`

### Response Validation
\`\`\`go
func (pc *PaymentClient) validateWebhook(payload []byte, signature string) error {
    expectedSignature := pc.createWebhookSignature(payload)
    
    if !hmac.Equal([]byte(signature), []byte(expectedSignature)) {
        return errors.New("invalid webhook signature")
    }
    
    return nil
}

func (pc *PaymentClient) createWebhookSignature(payload []byte) string {
    h := hmac.New(sha256.New, []byte(pc.secretKey))
    h.Write(payload)
    return hex.EncodeToString(h.Sum(nil))
}
\`\`\`

## Error Handling and Retry Logic

### Circuit Breaker Pattern
\`\`\`go
type CircuitBreaker struct {
    maxFailures int
    timeout     time.Duration
    failures    int
    lastFailure time.Time
    state       string // "closed", "open", "half-open"
    mutex       sync.RWMutex
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    cb.mutex.Lock()
    defer cb.mutex.Unlock()
    
    if cb.state == "open" {
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.state = "half-open"
        } else {
            return errors.New("circuit breaker is open")
        }
    }
    
    err := fn()
    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()
        
        if cb.failures >= cb.maxFailures {
            cb.state = "open"
        }
        return err
    }
    
    cb.failures = 0
    cb.state = "closed"
    return nil
}
\`\`\`

### Exponential Backoff Retry
\`\`\`go
func (pc *PaymentClient) retryWithBackoff(ctx context.Context, operation func() error) error {
    maxRetries := 3
    baseDelay := time.Second
    
    for attempt := 0; attempt < maxRetries; attempt++ {
        err := operation()
        if err == nil {
            return nil
        }
        
        if !isRetryableError(err) {
            return err
        }
        
        if attempt == maxRetries-1 {
            return fmt.Errorf("max retries exceeded: %w", err)
        }
        
        delay := time.Duration(math.Pow(2, float64(attempt))) * baseDelay
        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-time.After(delay):
            continue
        }
    }
    
    return nil
}

func isRetryableError(err error) bool {
    // Define which errors are retryable
    retryableCodes := []int{500, 502, 503, 504, 429}
    
    if httpErr, ok := err.(*HTTPError); ok {
        for _, code := range retryableCodes {
            if httpErr.StatusCode == code {
                return true
            }
        }
    }
    
    return false
}
\`\`\`

> **Security Note**: Never log sensitive payment data. Use structured logging with appropriate field masking for audit trails.`,
          resources: [
            { title: "API Security Guidelines", url: "#", type: "internal" },
            { title: "Webhook Security", url: "#", type: "internal" },
          ],
        },
      ],
    },
    "6": {
      title: "A/B Testing Implementation for Mobile Apps",
      description:
        "Learn how to implement A/B testing in mobile applications using Gojek's experimentation platform, including feature flags, user segmentation, and statistical analysis.",
      estimatedTime: "55m",
      difficulty: "Intermediate",
      lastUpdated: "Just created",
      progress: 0,
      steps: [
        {
          id: 1,
          title: "A/B Testing Architecture",
          description: "Understand Gojek's experimentation platform and mobile A/B testing infrastructure",
          estimatedTime: "15 min",
          content: `# A/B Testing Architecture for Mobile Apps

## Gojek's Experimentation Platform

### Core Components
- **Experiment Service**: Manages experiment configurations
- **Feature Flag Service**: Controls feature rollouts
- **Analytics Pipeline**: Collects and processes experiment data
- **Statistical Engine**: Calculates significance and confidence intervals
- **Dashboard**: Visualizes experiment results

### Mobile SDK Architecture
\`\`\`kotlin
// Android SDK Example
class ExperimentSDK private constructor(
    private val apiClient: ExperimentAPIClient,
    private val localStorage: ExperimentStorage,
    private val analytics: AnalyticsClient
) {
    companion object {
        @Volatile
        private var INSTANCE: ExperimentSDK? = null
        
        fun getInstance(context: Context): ExperimentSDK {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: ExperimentSDK(
                    ExperimentAPIClient(context),
                    ExperimentStorage(context),
                    AnalyticsClient(context)
                ).also { INSTANCE = it }
            }
        }
    }
    
    suspend fun initialize(userId: String, userAttributes: Map<String, Any>) {
        try {
            val experiments = apiClient.fetchExperiments(userId, userAttributes)
            localStorage.storeExperiments(experiments)
            
            // Track initialization
            analytics.track("experiment_sdk_initialized", mapOf(
                "user_id" to userId,
                "experiments_count" to experiments.size
            ))
        } catch (e: Exception) {
            // Fallback to cached experiments
            Log.w("ExperimentSDK", "Failed to fetch experiments, using cache", e)
        }
    }
    
    fun getVariant(experimentKey: String, defaultVariant: String = "control"): String {
        return localStorage.getExperiment(experimentKey)?.variant ?: defaultVariant
    }
    
    fun trackConversion(experimentKey: String, conversionEvent: String, value: Double? = null) {
        analytics.track("experiment_conversion", mapOf(
            "experiment_key" to experimentKey,
            "conversion_event" to conversionEvent,
            "value" to value
        ))
    }
}
\`\`\`

## Experiment Configuration

### Experiment Definition
\`\`\`json
{
  "experiment_id": "gofood_checkout_flow_v2",
  "name": "Go-Food Checkout Flow Optimization",
  "description": "Test new checkout flow to improve conversion rate",
  "status": "active",
  "start_date": "2024-01-15T00:00:00Z",
  "end_date": "2024-02-15T23:59:59Z",
  "traffic_allocation": 0.2,
  "variants": [
    {
      "key": "control",
      "name": "Current Checkout Flow",
      "allocation": 0.5,
      "config": {
        "checkout_steps": 3,
        "payment_methods_order": ["gopay", "credit_card", "bank_transfer"],
        "show_promo_banner": false
      }
    },
    {
      "key": "treatment",
      "name": "Simplified Checkout Flow",
      "allocation": 0.5,
      "config": {
        "checkout_steps": 2,
        "payment_methods_order": ["gopay", "credit_card"],
        "show_promo_banner": true,
        "auto_apply_best_promo": true
      }
    }
  ],
  "targeting": {
    "user_segments": ["active_users"],
    "countries": ["ID", "SG", "TH"],
    "app_versions": [">=4.50.0"],
    "device_types": ["android", "ios"]
  },
  "metrics": {
    "primary": {
      "name": "checkout_completion_rate",
      "type": "conversion",
      "description": "Percentage of users who complete checkout"
    },
    "secondary": [
      {
        "name": "average_order_value",
        "type": "numeric",
        "description": "Average value of completed orders"
      },
      {
        "name": "time_to_checkout",
        "type": "numeric",
        "description": "Time taken to complete checkout in seconds"
      }
    ]
  }
}
\`\`\`

### User Segmentation
\`\`\`kotlin
data class UserAttributes(
    val userId: String,
    val country: String,
    val appVersion: String,
    val deviceType: String,
    val userSegment: String,
    val registrationDate: Date,
    val totalOrders: Int,
    val averageOrderValue: Double,
    val preferredPaymentMethod: String
)

class UserSegmentationService {
    fun getUserSegment(attributes: UserAttributes): String {
        return when {
            attributes.totalOrders >= 50 && attributes.averageOrderValue >= 100000 -> "vip_users"
            attributes.totalOrders >= 10 -> "active_users"
            attributes.totalOrders >= 1 -> "casual_users"
            else -> "new_users"
        }
    }
    
    fun isEligibleForExperiment(
        experiment: Experiment,
        attributes: UserAttributes
    ): Boolean {
        val targeting = experiment.targeting
        
        return targeting.countries.contains(attributes.country) &&
               targeting.userSegments.contains(getUserSegment(attributes)) &&
               isVersionCompatible(targeting.appVersions, attributes.appVersion) &&
               targeting.deviceTypes.contains(attributes.deviceType)
    }
    
    private fun isVersionCompatible(requirement: String, userVersion: String): Boolean {
        // Parse version requirements like ">=4.50.0"
        val regex = Regex("([><=]+)([0-9.]+)")
        val match = regex.find(requirement) ?: return false
        
        val operator = match.groupValues[1]
        val requiredVersion = match.groupValues[2]
        
        return compareVersions(userVersion, requiredVersion, operator)
    }
}
\`\`\`

## Statistical Considerations

### Sample Size Calculation
\`\`\`kotlin
class StatisticalCalculator {
    fun calculateSampleSize(
        baselineConversionRate: Double,
        minimumDetectableEffect: Double,
        alpha: Double = 0.05,
        power: Double = 0.8
    ): Int {
        val p1 = baselineConversionRate
        val p2 = p1 * (1 + minimumDetectableEffect)
        
        val zAlpha = 1.96 // for alpha = 0.05
        val zBeta = 0.84  // for power = 0.8
        
        val pooledP = (p1 + p2) / 2
        val numerator = (zAlpha * sqrt(2 * pooledP * (1 - pooledP)) + 
                        zBeta * sqrt(p1 * (1 - p1) + p2 * (1 - p2))).pow(2)
        val denominator = (p2 - p1).pow(2)
        
        return ceil(numerator / denominator).toInt()
    }
    
    fun calculateStatisticalSignificance(
        controlConversions: Int,
        controlSample: Int,
        treatmentConversions: Int,
        treatmentSample: Int
    ): StatisticalResult {
        val p1 = controlConversions.toDouble() / controlSample
        val p2 = treatmentConversions.toDouble() / treatmentSample
        
        val pooledP = (controlConversions + treatmentConversions).toDouble() / 
                     (controlSample + treatmentSample)
        
        val standardError = sqrt(pooledP * (1 - pooledP) * (1.0/controlSample + 1.0/treatmentSample))
        val zScore = (p2 - p1) / standardError
        val pValue = 2 * (1 - normalCDF(abs(zScore)))
        
        return StatisticalResult(
            controlConversionRate = p1,
            treatmentConversionRate = p2,
            lift = (p2 - p1) / p1,
            zScore = zScore,
            pValue = pValue,
            isSignificant = pValue < 0.05,
            confidenceInterval = calculateConfidenceInterval(p1, p2, standardError)
        )
    }
}
\`\`\`

> **Important**: Always ensure sufficient sample size before drawing conclusions. Gojek requires minimum 1000 users per variant and 7 days of data collection.`,
          resources: [
            { title: "Statistical Analysis Guide", url: "#", type: "internal" },
            { title: "Experiment Design Principles", url: "#", type: "internal" },
          ],
        },
      ],
    },
  }

  const guideData = mockGuides[guideId as keyof typeof mockGuides] || mockGuides["2"]

  const toggleStepCompletion = (stepId: number) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]))
  }

  const completionPercentage = (completedSteps.length / guideData.steps.length) * 100

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
        {/* Guide Content */}
        <div className="flex-1 p-3 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Guide Header */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{guideData.title}</h1>
                  <p className="text-muted-foreground text-base md:text-lg max-w-4xl">{guideData.description}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 w-fit">Generated by Tara AI</Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {guideData.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {guideData.steps.length} steps
                </div>
                <Badge variant="secondary">{guideData.difficulty}</Badge>
              </div>

              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/80">
                  This guide uses Gojek's internal infrastructure and follows established engineering practices across
                  our platform.
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Guide Steps */}
            <div className="space-y-6">
              {guideData.steps.map((step, index) => (
                <Card key={step.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-10 w-10 rounded-full p-0 flex-shrink-0 ${
                            completedSteps.includes(step.id)
                              ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                              : "hover:bg-primary hover:text-primary-foreground"
                          }`}
                          onClick={() => toggleStepCompletion(step.id)}
                        >
                          {completedSteps.includes(step.id) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-semibold">{step.id}</span>
                          )}
                        </Button>
                        <div className="space-y-2 min-w-0">
                          <CardTitle className="text-lg md:text-xl">{step.title}</CardTitle>
                          <p className="text-muted-foreground text-sm md:text-base">{step.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{step.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <MarkdownRenderer content={step.content} />

                    {step.resources && step.resources.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-semibold text-sm">Related Resources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((resource, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-8 bg-transparent hover:bg-primary/10"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {resource.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Guide Sidebar */}
        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l bg-muted/20 p-3 md:p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed Steps</span>
                    <span>
                      {completedSteps.length}/{guideData.steps.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completionPercentage === 100 ? "Guide completed! 🎉" : "Keep going, you're doing great!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent hover:bg-primary/10">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Commands
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent hover:bg-primary/10">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent hover:bg-primary/10">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guide Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span className="text-muted-foreground">{guideData.lastUpdated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Generated From</span>
                  <span className="text-muted-foreground">Engineering Docs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Difficulty</span>
                  <Badge variant="secondary">{guideData.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tara Chatbot */}
      <TaraChatbot context="guide" />
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
