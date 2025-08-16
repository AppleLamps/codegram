"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { SnippetCard } from "@/components/snippet-card"
import { CommentSection } from "@/components/comment-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SnippetPage() {
  const params = useParams()
  const user = useUser()
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
    if (!user) return

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
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <span className="sr-only">Loading snippet details...</span>
          Loading...
        </div>
      </div>
    )
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="main">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Snippet not found</h1>
          <p className="text-muted-foreground mb-6">The snippet you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="focus-ring">
            <Link href="/" aria-label="Return to the home page">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl" role="main">
      <nav className="mb-6" role="navigation" aria-label="Breadcrumb">
        <Button variant="ghost" asChild className="focus-ring">
          <Link href="/" aria-label="Go back to the main feed">
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Feed
          </Link>
        </Button>
      </nav>

      <div className="space-y-8">
        <section aria-label="Code snippet details">
          <SnippetCard
            snippet={{
              ...snippet,
              createdAt: new Date(snippet.createdAt),
            }}
            onLike={handleLike}
            onRemix={handleRemix}
          />
        </section>

        <section id="comments" aria-label="Comments and discussions">
          <CommentSection snippetId={snippet.id} />
        </section>
      </div>
    </main>
  )
}
