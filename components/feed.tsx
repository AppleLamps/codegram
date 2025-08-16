"use client"
import { useState, useEffect } from "react"
import { useUser } from "@stackframe/stack"
import { SnippetCard } from "./snippet-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedSkeleton, ButtonLoading, Spinner } from "@/components/ui/loading"
import { Loader2 } from "lucide-react"

interface FeedProps {
  initialType?: "trending" | "following" | "recent" | "popular"
}

export function Feed({ initialType = "trending" }: FeedProps) {
  const user = useUser()
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [feedType, setFeedType] = useState(initialType)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [languages, setLanguages] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    fetchLanguages()
    fetchTags()
  }, [])

  useEffect(() => {
    setPage(1)
    setSnippets([])
    setHasMore(true)
    fetchSnippets(1, true)
  }, [feedType, selectedLanguage, selectedTag])

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/discover/languages")
      if (response.ok) {
        const data = await response.json()
        setLanguages(data)
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/discover/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    }
  }

  const fetchSnippets = async (pageNum: number, reset = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        type: feedType,
        page: pageNum.toString(),
        limit: "10",
      })

      if (selectedLanguage !== "all") params.append("language", selectedLanguage)
      if (selectedTag !== "all") params.append("tag", selectedTag)

      const response = await fetch(`/api/feed?${params}`)
      if (response.ok) {
        const newSnippets = await response.json()

        if (reset) {
          setSnippets(newSnippets)
        } else {
          setSnippets((prev) => [...prev, ...newSnippets])
        }

        setHasMore(newSnippets.length === 10)
        setPage(pageNum)
      }
    } catch (error) {
      console.error("Failed to fetch snippets:", error)
    }

    setLoading(false)
    setLoadingMore(false)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSnippets(page + 1)
    }
  }

  const handleLike = async (snippetId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/snippets/${snippetId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setSnippets((prev) =>
          prev.map((snippet) =>
            snippet.id === snippetId
              ? {
                  ...snippet,
                  isLiked: data.liked,
                  _count: {
                    ...snippet._count,
                    likes: data.liked ? snippet._count.likes + 1 : snippet._count.likes - 1,
                  },
                }
              : snippet,
          ),
        )
      }
    } catch (error) {
      console.error("Like error:", error)
    }
  }

  const handleRemix = (snippetId: string) => {
    window.location.href = `/create?remix=${snippetId}`
  }

  const clearFilters = () => {
    setSelectedLanguage("all")
    setSelectedTag("all")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Filter skeleton */}
        <div className="sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-2 z-40">
          <div className="grid grid-cols-4 gap-1 mb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 bg-muted/60 rounded-md animate-pulse" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="w-[120px] h-8 bg-muted/60 rounded-md animate-pulse" />
            <div className="w-[100px] h-8 bg-muted/60 rounded-md animate-pulse" />
          </div>
        </div>
        
        {/* Feed skeleton */}
        <FeedSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4 page-transition">
      <div className="sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-2 z-40">
        <Tabs value={feedType} onValueChange={(value) => setFeedType(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="trending" className="text-xs">
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular" className="text-xs">
              Popular
            </TabsTrigger>
            {user && (
              <TabsTrigger value="following" className="text-xs">
                Following
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 mt-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.name} value={lang.name}>
                  {lang.name} ({lang.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name} ({tag._count.snippets})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedLanguage !== "all" || selectedTag !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-0">
        {snippets.map((snippet, index) => (
          <div key={snippet.id} className="stagger-item">
            <SnippetCard
              snippet={{
                ...snippet,
                createdAt: new Date(snippet.createdAt),
              }}
              onLike={handleLike}
              onRemix={handleRemix}
            />
          </div>
        ))}
      </div>

      {snippets.length === 0 && (
        <EmptyState
          type="snippets"
          title={selectedLanguage !== "all" || selectedTag !== "all" ? "No snippets match your filters" : undefined}
          description={selectedLanguage !== "all" || selectedTag !== "all" ? "Try adjusting your filters or check back later for new content." : undefined}
          action={selectedLanguage !== "all" || selectedTag !== "all" ? {
            label: "Clear Filters",
            onClick: clearFilters
          } : undefined}
        />
      )}

      {hasMore && snippets.length > 0 && (
        <div className="text-center py-6">
          <ButtonLoading 
            loading={loadingMore} 
            onClick={loadMore} 
            className="btn-interactive btn-secondary px-6 py-2 rounded-full hover-lift"
          >
            {loadingMore ? "Loading more..." : "Load More Snippets"}
          </ButtonLoading>
        </div>
      )}
    </div>
  )
}
