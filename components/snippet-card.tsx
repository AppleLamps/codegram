"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SyntaxHighlighter } from "./syntax-highlighter"
import { FollowButton } from "./follow-button"
import { Heart, MessageCircle, Share, GitFork, MoreHorizontal } from "lucide-react"
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
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(snippet.isLiked || false)
  const [likeCount, setLikeCount] = useState(snippet._count.likes)

  const handleLike = () => {
    if (!session) return

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

  const isOwnSnippet = session?.user?.email && snippet.author.id === session.user.id

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={snippet.author.image || ""} />
              <AvatarFallback>{snippet.author.name?.[0] || snippet.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/@${snippet.author.username}`} className="font-medium hover:underline">
                  {snippet.author.name || snippet.author.username}
                </Link>
                {showFollowButton && !isOwnSnippet && <FollowButton username={snippet.author.username} />}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(snippet.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Link href={`/snippet/${snippet.id}`}>
            <h3 className="font-semibold text-lg hover:underline">{snippet.title}</h3>
          </Link>
          {snippet.description && <p className="text-muted-foreground mt-1">{snippet.description}</p>}
        </div>

        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {snippet.language}
            </Badge>
          </div>
          <SyntaxHighlighter code={snippet.code} language={snippet.language} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? "text-red-500" : ""}
              disabled={!session}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/snippet/${snippet.id}#comments`}>
                <MessageCircle className="h-4 w-4 mr-1" />
                {snippet._count.comments}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemix} disabled={!session}>
              <GitFork className="h-4 w-4 mr-1" />
              {snippet._count.forks}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
