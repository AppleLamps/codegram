"use client"

import { ReactNode, useState } from "react"
import { Spinner } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/empty-state"
import { ErrorBoundary } from "@/components/ui/error-boundary"

interface AsyncWrapperProps {
  loading?: boolean
  error?: Error | string | null
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  onRetry?: () => void
  className?: string
}

/**
 * A wrapper component that handles loading, error, and success states for async operations
 */
export function AsyncWrapper({
  loading = false,
  error = null,
  children,
  loadingComponent,
  errorComponent,
  onRetry,
  className = ""
}: AsyncWrapperProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        {loadingComponent || (
          <div className="text-center space-y-3">
            <Spinner size="lg" />
            <p className="text-muted-foreground text-body">Loading...</p>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <ErrorState
            title="Failed to load"
            description={typeof error === "string" ? error : error.message || "An error occurred while loading this content."}
            onRetry={onRetry}
          />
        )}
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  )
}

/**
 * Hook for managing async state
 */
export function useAsyncState<T>(initialData?: T) {
  const [state, setState] = useState({
    data: initialData,
    loading: false,
    error: null as Error | null
  })

  const execute = async (asyncFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const result = await asyncFn()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, loading: false, error: err }))
      throw err
    }
  }

  const reset = () => {
    setState({ data: initialData, loading: false, error: null })
  }

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Compact async wrapper for inline use
 */
export function InlineAsyncWrapper({
  loading,
  error,
  children,
  onRetry
}: {
  loading: boolean
  error?: Error | string | null
  children: ReactNode
  onRetry?: () => void
}) {
  if (loading) {
    return <Spinner size="sm" className="mx-auto" />
  }

  if (error) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-destructive mb-2">
          {typeof error === "string" ? error : error.message}
        </p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}