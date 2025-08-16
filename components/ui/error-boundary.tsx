"use client"

import React, { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardContent className="pt-8 pb-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-heading-3 font-semibold text-foreground">Something went wrong</h3>
                <p className="text-muted-foreground text-body">
                  An error occurred in this component. Please try refreshing or go back.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
            </div>
            
            <div className="space-y-3" role="group" aria-label="Error recovery actions">
              <Button 
                onClick={this.handleReset}
                className="w-full hover-lift focus-ring"
                aria-label="Try again to reload the component"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full hover-lift focus-ring">
                <Link href="/" aria-label="Go back to the home page">
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Compact error boundary for smaller components
export function CompactErrorBoundary({ 
  children, 
  message = "Something went wrong" 
}: { 
  children: ReactNode
  message?: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-4 space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-destructive" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}