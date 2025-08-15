"use client"

interface SyntaxHighlighterProps {
  code: string
  language: string
  className?: string
}

// Simple syntax highlighting for demo - in production you'd use a library like Prism.js or highlight.js
export function SyntaxHighlighter({ code, language, className = "" }: SyntaxHighlighterProps) {
  return (
    <pre className={`bg-muted rounded-lg p-4 overflow-x-auto text-sm ${className}`}>
      <code className="font-mono text-foreground whitespace-pre-wrap break-words">{code}</code>
    </pre>
  )
}
