"use client"

import ReactMarkdown from "react-markdown"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const codeString = String(children).replace(/\n$/, "")
            const language = className?.replace("language-", "") || "text"

            return !inline ? (
              <div className="relative group my-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(codeString)}
                >
                  {copiedCode === codeString ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto border">
                  <code className="text-sm font-mono text-foreground" {...props}>
                    {children}
                  </code>
                </pre>
                {language !== "text" && (
                  <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                    {language}
                  </div>
                )}
              </div>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mb-4 mt-6 border-b pb-2">{children}</h1>
          ),
          h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h3>,
          p: ({ children }) => <p className="text-foreground mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4 bg-muted/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} className="text-primary hover:underline font-medium">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
