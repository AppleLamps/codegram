"use client"
import { useState } from "react"
import { useUser } from "@stackframe/stack"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SyntaxHighlighter } from "./syntax-highlighter"
import { FollowButton } from "./follow-button"
import { Heart, MessageCircle, Share, GitFork, MoreHorizontal, Copy } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface SnippetCardProps {
  snippet: {
    id: string
    title: string
    description?: string
    code: string
    language: string
    createdAt: Date
    author: {
      id: string
      username: string
      name?: string
      image?: string
    }
    tags: Array<{
      id: string
      name: string
      color?: string
    }>
    _count: {
      likes: number
      comments: number
      forks: number
    }
    isLiked?: boolean
  }
  onLike?: (snippetId: string) => void
  onRemix?: (snippetId: string) => void
  showFollowButton?: boolean
}

export function SnippetCard({ snippet, onLike, onRemix, showFollowButton = true }: SnippetCardProps) {
  const user = useUser()
  const [isLiked, setIsLiked] = useState(snippet.isLiked || false)
  const [likeCount, setLikeCount] = useState(snippet._count.likes)

  const handleLike = () => {
    if (!user) return

    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
    onLike?.(snippet.id)
  }

  const handleRemix = () => {
    onRemix?.(snippet.id)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/snippet/${snippet.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: snippet.title,
          text: snippet.description || "Check out this code snippet!",
          url,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  const isOwnSnippet = user && snippet.author.id === user.id

  return (
    <Card className="snippet-card group relative overflow-hidden bg-gradient-to-br from-card/80 via-card to-card/60 backdrop-blur-xl border border-border/20 hover:border-border/40 shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] rounded-2xl" role="article" aria-labelledby={`snippet-title-${snippet.id}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60" />
      <CardHeader className="pb-4 relative z-10 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <Link 
              href={`/@${snippet.author.username}`} 
              className="flex-shrink-0 group/avatar hover-lift transition-all duration-300 focus-ring rounded-2xl p-1 -m-1"
              aria-label={`View ${snippet.author.name || snippet.author.username}'s profile`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover/avatar:ring-primary/40 shadow-lg group-hover/avatar:shadow-xl transition-all duration-300">
                  <AvatarImage src={snippet.author.image || ""} alt={`${snippet.author.name || snippet.author.username} profile picture`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30 text-foreground font-semibold text-sm">{snippet.author.name?.[0] || snippet.author.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-background shadow-sm" />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <Link 
                    href={`/@${snippet.author.username}`} 
                    className="font-semibold text-foreground hover:text-primary transition-all duration-200 truncate focus-ring rounded-lg px-1 -mx-1 group/name"
                    aria-label={`View ${snippet.author.name || snippet.author.username}'s profile`}
                  >
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover/name:from-primary group-hover/name:to-secondary transition-all duration-300">
                      {snippet.author.name || snippet.author.username}
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 text-muted-foreground/70 mt-1">
                    <time 
                      dateTime={snippet.createdAt.toISOString()} 
                      className="text-xs font-medium hover:text-muted-foreground transition-colors duration-200"
                      title={`Created on ${snippet.createdAt.toLocaleDateString()}`}
                    >
                      {formatDistanceToNow(snippet.createdAt, { addSuffix: true })}
                    </time>
                  </div>
                </div>
                {showFollowButton && !isOwnSnippet && (
                  <div className="flex-shrink-0">
                    <FollowButton username={snippet.author.username} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 focus-ring"
            aria-label="More options for this snippet"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>



        <div className="space-y-3">
          <Link href={`/snippet/${snippet.id}`} className="focus-ring rounded-lg">
            <h3 id={`snippet-title-${snippet.id}`} className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-all duration-300 leading-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent hover:from-primary hover:to-secondary transition-all duration-300">
                {snippet.title}
              </span>
            </h3>
          </Link>
          {snippet.description && (
            <p className="text-muted-foreground/80 text-sm md:text-base line-clamp-2 leading-relaxed" aria-describedby={`snippet-title-${snippet.id}`}>{snippet.description}</p>
          )}
        </div>

        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2" role="list" aria-label="Snippet tags">
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <Link 
                key={tag.id} 
                href={`/tags/${encodeURIComponent(tag.name)}`} 
                className="focus-ring rounded-xl group/tag"
                aria-label={`View snippets tagged with ${tag.name}`}
              >
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-3 py-1.5 font-medium transition-all duration-300 border border-border/20 shadow-sm hover:shadow-md group-hover/tag:scale-105 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary' :
                    index === 1 ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 text-secondary' :
                    'bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50'
                  }`}
                  role="listitem"
                >
                  #{tag.name}
                </Badge>
              </Link>
            ))}
            {snippet.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-3 py-1.5 text-muted-foreground border-dashed border-border/40 hover:border-border/60 transition-colors duration-200 rounded-xl"
                aria-label={`${snippet.tags.length - 3} more tags`}
              >
                +{snippet.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4 relative z-10">
        <div>
          <div className="code-preview relative overflow-hidden rounded-2xl border border-border/20 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/5 hover:from-muted/30 hover:via-muted/20 hover:to-muted/10 transition-all duration-500 shadow-inner group/code" role="region" aria-label="Code preview">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 opacity-0 group-hover/code:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 border-b border-border/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1 bg-muted/30 rounded-md">
                  {snippet.language}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-lg bg-background/20 hover:bg-background/40 border border-border/20 hover:border-border/40 transition-all duration-200 group/copy"
                onClick={() => {
                  navigator.clipboard.writeText(snippet.code)
                  // You could add a toast notification here
                }}
                aria-label="Copy code to clipboard"
              >
                <Copy className="h-3.5 w-3.5 group-hover/copy:scale-110 transition-transform duration-200" aria-hidden="true" />
              </Button>
            </div>
            <div className="relative z-10">
              <SyntaxHighlighter code={snippet.code} language={snippet.language} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gradient-to-r from-transparent via-border/30 to-transparent relative" role="toolbar" aria-label="Snippet actions">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-10 px-4 transition-all duration-300 hover-lift focus-ring rounded-xl group/like relative overflow-hidden ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 dark:from-red-950/30 dark:to-red-900/20 dark:hover:from-red-950/50 dark:hover:to-red-900/30 shadow-sm shadow-red-200/50 dark:shadow-red-900/20' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-100/30 dark:hover:from-red-950/20 dark:hover:to-red-900/10 border border-border/20 hover:border-red-200/50 dark:hover:border-red-800/30'
              }`}
              disabled={!user}
              aria-label={`${isLiked ? 'Unlike' : 'Like'} this snippet (${likeCount} likes)`}
              aria-pressed={isLiked}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 opacity-0 group-hover/like:opacity-100 transition-opacity duration-300" />
              <Heart className={`h-4 w-4 mr-2.5 transition-all duration-300 relative z-10 ${
                isLiked ? 'fill-current scale-110 animate-pulse' : 'group-hover/like:scale-125 group-hover/like:rotate-12'
              }`} aria-hidden="true" />
              <span className="font-semibold text-sm relative z-10">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 px-4 transition-all duration-300 hover-lift focus-ring rounded-xl group/comment relative overflow-hidden text-muted-foreground hover:text-blue-500 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/30 dark:hover:from-blue-950/20 dark:hover:to-blue-900/10 border border-border/20 hover:border-blue-200/50 dark:hover:border-blue-800/30" 
              asChild
            >
              <Link href={`/snippet/${snippet.id}#comments`} aria-label={`View comments (${snippet._count.comments} comments)`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 opacity-0 group-hover/comment:opacity-100 transition-opacity duration-300" />
                <MessageCircle className="h-4 w-4 mr-2.5 transition-all duration-300 relative z-10 group-hover/comment:scale-125 group-hover/comment:-rotate-12" aria-hidden="true" />
                <span className="font-semibold text-sm relative z-10">{snippet._count.comments}</span>
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 px-4 transition-all duration-300 hover-lift focus-ring rounded-xl group/fork relative overflow-hidden text-muted-foreground hover:text-green-500 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-green-100/30 dark:hover:from-green-950/20 dark:hover:to-green-900/10 border border-border/20 hover:border-green-200/50 dark:hover:border-green-800/30" 
              onClick={handleRemix} 
              disabled={!user}
              aria-label={`Fork this snippet (${snippet._count.forks} forks)`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover/fork:opacity-100 transition-opacity duration-300" />
              <GitFork className="h-4 w-4 mr-2.5 transition-all duration-300 relative z-10 group-hover/fork:scale-125 group-hover/fork:rotate-12" aria-hidden="true" />
              <span className="font-semibold text-sm relative z-10">{snippet._count.forks}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 flex-shrink-0 transition-all duration-300 hover-lift focus-ring rounded-xl group/share relative overflow-hidden text-muted-foreground hover:text-purple-500 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-purple-100/30 dark:hover:from-purple-950/20 dark:hover:to-purple-900/10 border border-border/20 hover:border-purple-200/50 dark:hover:border-purple-800/30" 
            onClick={handleShare}
            aria-label="Share this snippet"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-400/10 opacity-0 group-hover/share:opacity-100 transition-opacity duration-300" />
            <Share className="h-4 w-4 transition-all duration-300 relative z-10 group-hover/share:scale-125 group-hover/share:rotate-12" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
