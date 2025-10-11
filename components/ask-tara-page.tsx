"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Send, Sparkles, Upload, Github, Globe, HardDrive, Link, FileText, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { ContentTypeSelector } from "@/components/content-type-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiService, OAuthTokenResponse } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface UploadedFile {
  id: string
  name: string
  type: "pdf" | "link"
  size?: string
  url?: string
}

interface Integration {
  id: string
  type: "github" | "drive"
  name: string
  description: string
  connected: boolean
}

export function AskTaraPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [message, setMessage] = useState("")
  const [selectedType, setSelectedType] = useState<"course" | "guide" | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [linkUrl, setLinkUrl] = useState("")
  const [messages, setMessages] = useState<
    Array<{
      id: string
      content: string
      isUser: boolean
      timestamp: Date
    }>
  >([])
  const [oauthTokens, setOauthTokens] = useState<OAuthTokenResponse[]>([])
  const [integrationsLoading, setIntegrationsLoading] = useState(true)
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch OAuth tokens when user is authenticated
  useEffect(() => {
    const fetchOAuthTokens = async () => {
      // Only fetch if user is authenticated and not loading
      if (!isAuthenticated || authLoading) {
        setIntegrationsLoading(false)
        return
      }

      try {
        setIntegrationsLoading(true)
        
        // First test basic API connection
        const basicConnection = await apiService.testBasicConnection()
        if (!basicConnection) {
          throw new Error('Cannot connect to API server - basic connection failed')
        }
        
        // Then test authenticated API connection
        try {
          await apiService.testConnection()
        } catch (healthError) {
          throw new Error('Cannot connect to API server - authentication failed')
        }
        
        // Then fetch OAuth tokens
        const response = await apiService.getOAuthTokens(['github', 'drive'])
        setOauthTokens(response.tokens)
      } catch (error) {
        setOauthTokens([])
      } finally {
        setIntegrationsLoading(false)
      }
    }

    fetchOAuthTokens()
  }, [isAuthenticated, authLoading])

  // Create integrations array with dynamic connection status
  const integrations: Integration[] = [
    {
      id: "github",
      type: "github",
      name: "GitHub Repository",
      description: "Connect your GitHub repositories for code analysis",
      connected: oauthTokens.some(token => token.provider === 'github'),
    },
    {
      id: "drive",
      type: "drive",
      name: "Google Drive",
      description: "Access documents and files from Google Drive",
      connected: oauthTokens.some(token => token.provider === 'drive'),
    },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const newFile: UploadedFile = {
          id: `file-${crypto.randomUUID()}`,
          name: file.name,
          type: "pdf",
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        }
        setUploadedFiles((prev) => [...prev, newFile])
      })
    }
  }

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      const newLink: UploadedFile = {
        id: `link-${crypto.randomUUID()}`,
        name: linkUrl,
        type: "link",
        url: linkUrl,
      }
      setUploadedFiles((prev) => [...prev, newLink])
      setLinkUrl("")
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedType || isProcessing) return

    console.log("🚀 Starting message processing...")
    setIsProcessing(true)

    const newMessage = {
      id: crypto.randomUUID(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    // Show AI response immediately
    const filesContext =
      uploadedFiles.length > 0 ? ` I'll also analyze the ${uploadedFiles.length} file(s) you've uploaded.` : ""
    const aiResponse = {
      id: crypto.randomUUID(),
      content: `I'll help you create a ${selectedType} about "${message}". Let me analyze your company's codebase, documentation, and best practices to generate comprehensive content.${filesContext}`,
      isUser: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiResponse])

    // Redirect to generation page for both courses and guides
    setTimeout(() => {
      console.log("🔄 Redirecting to generation page...")
      const encodedMessage = encodeURIComponent(message)
      const encodedFiles = uploadedFiles.length > 0 ? encodeURIComponent(JSON.stringify(uploadedFiles)) : ""
      
      // Pass only non-sensitive data to the generation page
      // OAuth tokens will be fetched securely from the API
      const params = new URLSearchParams({
        type: selectedType,
        topic: encodedMessage,
        ...(encodedFiles && { files: encodedFiles })
      })
      
      window.location.href = `/generate?${params.toString()}`
    }, 2000)

    setMessage("")
    setSelectedType(null)
  }

  const suggestedQuestions = [
    "How to implement real-time recommendation API in Go-Food Merchant app Homepage?",
    "What's our microservices deployment process using Kubernetes?",
    "How to integrate with our internal payment gateway system?",
    "Best practices for handling high-traffic scenarios in Go-Ride?",
    "How to implement event-driven architecture for order processing?",
    "What's our approach to A/B testing in mobile applications?",
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pb-40">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>
              <h2 className="mb-4 text-xl md:text-2xl font-bold">What can I help you learn?</h2>
              <p className="mb-6 md:mb-8 text-sm md:text-base text-muted-foreground px-4">
                Ask me anything about your company's codebase, documentation, or processes. I'll create personalized
                courses or guides based on your internal resources.
              </p>
            </div>

            {/* Upload and Integration Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="files" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="files">Files</TabsTrigger>
                      <TabsTrigger value="links">Links</TabsTrigger>
                    </TabsList>
                    <TabsContent value="files" className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, DOC, TXT, MD files supported</p>
                        </label>
                      </div>
                    </TabsContent>
                    <TabsContent value="links" className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter URL or documentation link"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddLink()}
                        />
                        <Button onClick={handleAddLink} size="sm">
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Uploaded Files:</p>
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            {file.type === "pdf" ? (
                              <FileText className="h-4 w-4 text-red-500" />
                            ) : (
                              <Link className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="text-sm truncate">{file.name}</span>
                            {file.size && (
                              <Badge variant="secondary" className="text-xs">
                                {file.size}
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {authLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Authenticating...
                      </div>
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-sm text-muted-foreground">
                        Please log in to view integrations
                      </div>
                    </div>
                  ) : integrationsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Loading integrations...
                      </div>
                    </div>
                  ) : (
                    integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {integration.type === "github" && <Github className="h-5 w-5" />}
                          {integration.type === "drive" && <HardDrive className="h-5 w-5" />}
                          <div>
                            <p className="font-medium text-sm">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <Button
                          variant={integration.connected ? "default" : "outline"}
                          size="sm"
                          disabled={integration.connected || connectingProvider === integration.type}
                          onClick={async () => {
                            if (!integration.connected) {
                              try {
                                setConnectingProvider(integration.type)
                                if (integration.type === "github") {
                                  // Get GitHub auth URL from backend
                                  const response = await apiService.getGitHubAuthUrl()
                                  // Redirect to GitHub OAuth
                                  window.location.href = response.auth_url
                                } else if (integration.type === "drive") {
                                  // Get Google Drive auth URL from backend
                                  const response = await apiService.getGoogleDriveAuthUrl()
                                  // Redirect to Google Drive OAuth
                                  window.location.href = response.auth_url
                                }
                              } catch (error) {
                                console.error("Failed to initiate OAuth:", error)
                                setConnectingProvider(null)
                                // You could show a toast notification here
                              }
                            }
                          }}
                          className={integration.connected ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                        >
                          {connectingProvider === integration.type ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Connecting...
                            </>
                          ) : (
                            integration.connected ? "Connected" : "Connect"
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Suggested Questions as Scrollable Chips */}
            <div className="space-y-3 px-4">
              <p className="text-sm font-medium text-left">Suggested questions:</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex-shrink-0 h-auto py-2 px-3 text-xs sm:text-sm whitespace-normal text-left leading-relaxed min-w-[200px] max-w-[280px] sm:max-w-[320px] md:max-w-[360px] hover:bg-primary/10 border-primary/20 bg-transparent"
                    onClick={() => setMessage(question)}
                  >
                    <span className="line-clamp-3">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} content={msg.content} isUser={msg.isUser} timestamp={msg.timestamp} />
            ))}
          </div>
        </div>
      )}

      {/* Floating Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 md:p-4 z-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <ContentTypeSelector selectedType={selectedType} onTypeSelect={setSelectedType} />

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Ask Tara about your company's processes, code, or documentation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 text-sm md:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !selectedType || isProcessing}
              className="px-4 md:px-6 w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2 sm:mr-0" />
                  <span className="sm:hidden">Processing...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
