"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useUser } from "@stackframe/stack"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { MessageCircle, Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    name?: string
    image?: string
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  snippetId: string
}

export function CommentSection({ snippetId }: CommentSectionProps) {
  const user = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [snippetId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/snippets/${snippetId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
    setLoading(false)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/snippets/${snippetId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
    }
    setIsSubmitting(false)
  }

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!replyContent.trim() || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/snippets/${snippetId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId }),
      })

      if (response.ok) {
        const reply = await response.json()
        // Update the comments to include the new reply
        setComments(
          comments.map((comment) =>
            comment.id === parentId ? { ...comment, replies: [...(comment.replies || []), reply] } : comment,
          ),
        )
        setReplyContent("")
        setReplyTo(null)
      }
    } catch (error) {
      console.error("Failed to post reply:", error)
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {user && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback>{user.displayName?.[0] || user.primaryEmail?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.image || ""} />
                  <AvatarFallback>{comment.user.name?.[0] || comment.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/@${comment.user.username}`} className="font-medium hover:underline">
                      {comment.user.name || comment.user.username}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>

                  {replyTo === comment.id && user && (
                    <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3 space-y-2">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={!replyContent.trim() || isSubmitting}>
                          {isSubmitting ? "Replying..." : "Reply"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-4 space-y-3 border-l-2 border-muted pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.user.image || ""} />
                            <AvatarFallback className="text-xs">
                              {reply.user.name?.[0] || reply.user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Link href={`/@${reply.user.username}`} className="font-medium text-sm hover:underline">
                                {reply.user.name || reply.user.username}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <EmptyState
          type="comments"
          className="py-8"
        />
      )}
    </div>
  )
}
