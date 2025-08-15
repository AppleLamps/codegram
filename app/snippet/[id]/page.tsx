"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { SnippetCard } from "@/components/snippet-card"
import { CommentSection } from "@/components/comment-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SnippetPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [snippet, setSnippet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippets/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSnippet(data)
        }
      } catch (error) {
        console.error("Failed to fetch snippet:", error)
      }
      setLoading(false)
    }

    if (params.id) {
      fetchSnippet()
    }
  }, [params.id])

  const handleLike = async (snippetId: string) => {
    if (!session) return

    try {
      const response = await fetch(`/api/snippets/${snippetId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setSnippet((prev: any) => ({
          ...prev,
          isLiked: data.liked,
          _count: {
            ...prev._count,
            likes: data.liked ? prev._count.likes + 1 : prev._count.likes - 1,
          },
        }))
      }
    } catch (error) {
      console.error("Like error:", error)
    }
  }

  const handleRemix = (snippetId: string) => {
    // Navigate to create page with snippet as parent
    window.location.href = `/create?remix=${snippetId}`
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Snippet not found</h1>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <SnippetCard
          snippet={{
            ...snippet,
            createdAt: new Date(snippet.createdAt),
          }}
          onLike={handleLike}
          onRemix={handleRemix}
        />

        <div id="comments">
          <CommentSection snippetId={snippet.id} />
        </div>
      </div>
    </div>
  )
}
