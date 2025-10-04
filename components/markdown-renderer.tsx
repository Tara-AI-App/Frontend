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
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // Validate content prop
  if (!content) {
    return <div className={`prose prose-sm max-w-none ${className}`}>No content available</div>
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            if (!children) return null
            
            return !inline ? (
              <code className="text-sm font-mono text-foreground">
                {children}
              </code>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            )
          },
          pre({ children }) {
            // This handles the pre element styling and structure for code blocks
            // Extract text content for copy functionality
            const codeString = typeof children === 'string' ? children : 
              children?.toString?.() || 
              (Array.isArray(children) ? children.join('') : '') || ''

            return (
              <div className="relative group my-4">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto border">
                  {children || ''}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(codeString)}
                >
                  {copiedCode === codeString ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
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
            <a href={href || '#'} className="text-primary hover:underline font-medium">
              {children || ''}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
