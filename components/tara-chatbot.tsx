"use client"

import { useState, useEffect } from "react"
import { Send, Sparkles, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface TaraChatbotProps {
  readonly context?: string // Course or guide context
}

export function TaraChatbot({ context = "course" }: TaraChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize messages after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (!hasInitialized) {
      setMessages([
        {
          id: "1",
          content: `Hi! I'm Tara, your AI learning assistant. I'm here to help you with any questions about this ${context}. Feel free to ask me anything!`,
          isUser: false,
          timestamp: new Date(),
        },
      ])
      setHasInitialized(true)
    }
  }, [context, hasInitialized])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        content: getAIResponse(message, context),
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)

    setMessage("")
  }

  const getAIResponse = (userMessage: string, context: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("explain") || lowerMessage.includes("what is")) {
      return `Great question! Let me break that down for you. In the context of this ${context}, that concept is important because it helps you understand the underlying principles. Would you like me to elaborate on any specific part?`
    }

    if (lowerMessage.includes("example") || lowerMessage.includes("show me")) {
      return `Here's a practical example that relates to what we're covering in this ${context}. This should help clarify the concept. Do you need more examples or have questions about implementation?`
    }

    if (lowerMessage.includes("how") || lowerMessage.includes("implement")) {
      return `To implement this, you'll want to follow the step-by-step approach outlined in the ${context}. The key is to start with the basics and build up gradually. Would you like me to walk you through the specific steps?`
    }

    if (lowerMessage.includes("error") || lowerMessage.includes("problem") || lowerMessage.includes("issue")) {
      return `I can help you troubleshoot that! Common issues with this topic usually stem from a few key areas. Let me guide you through some debugging steps that should help resolve the problem.`
    }

    return `That's an interesting question about this ${context}! Based on the content we're covering, I'd recommend focusing on the key concepts first. Is there a specific aspect you'd like me to dive deeper into?`
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        size="sm"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-80 shadow-xl z-50 transition-all duration-200 ${
        isMinimized ? "h-14" : "h-96"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary-foreground text-primary text-xs">
              <Sparkles className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-sm">Ask Tara</CardTitle>
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
        <CardContent className="p-0 flex flex-col h-80">
          <ScrollArea className="flex-1 p-3">
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
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about this content..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="text-xs"
                size="sm"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()} size="sm" className="px-2">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
