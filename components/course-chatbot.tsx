"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { apiService, CourseChatRequest, GuideChatRequest } from "@/lib/api"

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface CourseChatbotProps {
  courseId?: string
  guideId?: string
  courseTitle?: string
  guideTitle?: string
  context?: "course" | "guide"
}

export function CourseChatbot({ 
  courseId, 
  guideId, 
  courseTitle, 
  guideTitle, 
  context = "course" 
}: CourseChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const title = context === "course" ? courseTitle : guideTitle
  const itemId = context === "course" ? courseId : guideId

  // Initialize messages after component mounts
  useEffect(() => {
    if (!hasInitialized) {
      setMessages([
        {
          id: "1",
          content: `Hi! I'm Tara, your AI learning assistant for "${title || `this ${context}`}". I'm here to help you with questions specifically about this ${context}'s content, concepts, and implementation details. What would you like to know?`,
          isUser: false,
          timestamp: new Date(),
        },
      ])
      setHasInitialized(true)
    }
  }, [title, context, hasInitialized])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !itemId) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      let response
      
      if (context === "course") {
        const chatRequest: CourseChatRequest = {
          message: userMessage.content
        }
        response = await apiService.chatWithCourse(itemId, chatRequest)
      } else {
        const chatRequest: GuideChatRequest = {
          message: userMessage.content
        }
        response = await apiService.chatWithGuide(itemId, chatRequest)
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: response.response,
        isUser: false,
        timestamp: new Date(response.timestamp),
      }

      setMessages((prev) => [...prev, aiMessage])
      
      // Store session ID for this specific course/guide
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = "I'm sorry, I encountered an error. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes('Network error - cannot connect to server')) {
          errorContent = "I'm having trouble connecting to the server. Please check your internet connection and try again."
        } else if (error.message.includes('Authentication') || error.message.includes('authorization')) {
          errorContent = "I need you to be logged in to chat about this course. Please log in and try again."
        } else if (error.message.includes('Failed to fetch')) {
          errorContent = "I'm having trouble connecting to the server. Please try again in a moment."
        }
      }
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: errorContent,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        size="sm"
        title={`Chat about ${title || `this ${context}`}`}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Card
      className={`
        fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 transition-all duration-300
        ${isMinimized ? 'h-16' : 'h-96'}
      `}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary-foreground text-primary text-xs">
              <Sparkles className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-sm">Ask Tara</CardTitle>
            <span className="text-xs opacity-80">
              {title || `${context} chat`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex-1 flex flex-col h-80">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.isUser ? "justify-end" : "justify-start"}`}>
                  {!msg.isUser && (
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Sparkles className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] p-2 rounded-lg text-xs ${
                      msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`mt-1 text-xs opacity-70`}>
                      {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={`Ask about ${title || `this ${context}`}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="text-xs"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || isLoading} 
                size="sm" 
                className="px-2"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
