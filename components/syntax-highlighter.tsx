"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface SyntaxHighlighterProps {
  code: string
  language: string
  className?: string
  showCopy?: boolean
  maxLines?: number
}

// Enhanced syntax highlighting component with copy functionality and mobile optimization
export function SyntaxHighlighter({ 
  code, 
  language, 
  className = "", 
  showCopy = true,
  maxLines = 15
}: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  
  const lines = code.split('\n')
  const shouldTruncate = lines.length > maxLines
  const displayCode = shouldTruncate && !expanded 
    ? lines.slice(0, maxLines).join('\n') + '\n...'
    : code

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <div className={`relative group ${className}`} role="region" aria-label={`Code snippet in ${language}`}>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10 bg-background/80 hover:bg-background focus-ring"
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
          aria-live="polite"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
          ) : (
            <Copy className="h-3 w-3" aria-hidden="true" />
          )}
        </Button>
      )}
      
      <pre 
        className="bg-muted/50 border rounded-lg p-3 md:p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed"
        role="code"
        aria-label={`${language} code`}
        tabIndex={0}
      >
        <code className="text-foreground whitespace-pre-wrap break-words">
          {displayCode}
        </code>
      </pre>
      
      {shouldTruncate && (
        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 rounded-md px-2 py-1 border-0 focus:ring-2 focus:ring-primary/20"
            aria-label={expanded ? 'Collapse code snippet' : `Expand to show ${lines.length - maxLines} more lines`}
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : `Show ${lines.length - maxLines} more lines`}
          </Button>
        </div>
      )}
    </div>
  )
}
