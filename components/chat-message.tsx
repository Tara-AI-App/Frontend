import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  readonly content: string
  readonly isUser: boolean
  readonly timestamp: Date
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card className={cn("max-w-[70%]", isUser ? "bg-primary text-primary-foreground" : "")}>
        <CardContent className="p-3">
          <p className="text-sm">{content}</p>
          <p className={cn("mt-1 text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </CardContent>
      </Card>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
