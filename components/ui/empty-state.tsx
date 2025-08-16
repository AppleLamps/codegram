"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  Code, 
  Users, 
  Bell, 
  Heart, 
  MessageCircle, 
  Hash, 
  Plus,
  FileText,
  Folder,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

interface EmptyStateProps {
  type: 'search' | 'snippets' | 'users' | 'notifications' | 'comments' | 'tags' | 'following' | 'followers' | 'likes' | 'custom'
  title?: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const emptyStateConfig = {
  search: {
    icon: <Search className="w-12 h-12 text-muted-foreground" />,
    title: "No results found",
    description: "Try adjusting your search terms or filters to find what you're looking for.",
  },
  snippets: {
    icon: <Code className="w-12 h-12 text-muted-foreground" />,
    title: "No snippets yet",
    description: "Start sharing your code with the community by creating your first snippet.",
    action: {
      label: "Create Snippet",
      href: "/create"
    }
  },
  users: {
    icon: <Users className="w-12 h-12 text-muted-foreground" />,
    title: "No users found",
    description: "No users match your search criteria. Try a different search term.",
  },
  notifications: {
    icon: <Bell className="w-12 h-12 text-muted-foreground" />,
    title: "No notifications",
    description: "When people interact with your snippets, you'll see notifications here.",
  },
  comments: {
    icon: <MessageCircle className="w-12 h-12 text-muted-foreground" />,
    title: "No comments yet",
    description: "Be the first to share your thoughts on this snippet.",
  },
  tags: {
    icon: <Hash className="w-12 h-12 text-muted-foreground" />,
    title: "No tags found",
    description: "No tags match your search. Try exploring popular tags instead.",
  },
  following: {
    icon: <Users className="w-12 h-12 text-muted-foreground" />,
    title: "Not following anyone",
    description: "Discover and follow developers to see their latest snippets in your feed.",
    action: {
      label: "Discover Users",
      href: "/discover"
    }
  },
  followers: {
    icon: <Users className="w-12 h-12 text-muted-foreground" />,
    title: "No followers yet",
    description: "Share great snippets to attract followers and build your developer network.",
  },
  likes: {
    icon: <Heart className="w-12 h-12 text-muted-foreground" />,
    title: "No likes yet",
    description: "Explore snippets and like the ones you find useful or interesting.",
  },
  custom: {
    icon: <FileText className="w-12 h-12 text-muted-foreground" />,
    title: "No data",
    description: "There's nothing to show here right now.",
  }
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  icon, 
  action, 
  className = "" 
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayIcon = icon || config.icon
  const displayAction = action || config.action

  return (
    <div className={`text-center py-12 space-y-6 ${className}`}>
      <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
        {displayIcon}
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-heading-3 font-semibold text-foreground">{displayTitle}</h3>
        <p className="text-muted-foreground text-body">{displayDescription}</p>
      </div>
      {displayAction && (
        <div className="pt-2">
          {displayAction.href ? (
            <Button asChild className="hover-lift">
              <Link href={displayAction.href}>
                <Plus className="w-4 h-4 mr-2" />
                {displayAction.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={displayAction.onClick} className="hover-lift">
              <Plus className="w-4 h-4 mr-2" />
              {displayAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specialized empty state for error scenarios
export function ErrorState({ 
  title = "Something went wrong", 
  description = "An error occurred while loading this content. Please try again.",
  onRetry,
  className = ""
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`text-center py-12 space-y-6 ${className}`}>
      <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-heading-3 font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-body">{description}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button onClick={onRetry} variant="outline" className="hover-lift">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}

// Compact empty state for smaller spaces
export function CompactEmptyState({ 
  icon, 
  title, 
  description,
  className = ""
}: {
  icon: ReactNode
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={`text-center py-8 space-y-3 ${className}`}>
      <div className="w-12 h-12 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-body-large font-medium text-foreground">{title}</h4>
        {description && (
          <p className="text-muted-foreground text-body-small">{description}</p>
        )}
      </div>
    </div>
  )
}