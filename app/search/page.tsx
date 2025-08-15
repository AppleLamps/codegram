"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SnippetCard } from "@/components/snippet-card"
import { Search, Users, Hash, Code } from "lucide-react"
import Link from "next/link"
import { debounce } from "lodash"

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "dart",
  "html",
  "css",
  "sql",
  "bash",
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "all")
  const [language, setLanguage] = useState(searchParams.get("language") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance")
  const [results, setResults] = useState<any>({ snippets: [], users: [], tags: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, activeTab, language, sortBy, 1)
      } else {
        setResults({ snippets: [], users: [], tags: [], total: 0 })
      }
    }, 300),
    [activeTab, language, sortBy],
  )

  useEffect(() => {
    const initialQuery = searchParams.get("q")
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery, activeTab, language, sortBy, 1)
    }
  }, [])

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const performSearch = async (searchQuery: string, type: string, lang: string, sort: string, pageNum: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type,
        page: pageNum.toString(),
        limit: "20",
      })

      if (lang !== "all") params.append("language", lang)
      if (sort !== "relevance") params.append("sort", sort)

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()

      if (pageNum === 1) {
        setResults(data)
      } else {
        setResults((prev: any) => ({
          ...data,
          [type === "all" ? "snippets" : type]: [
            ...prev[type === "all" ? "snippets" : type],
            ...data[type === "all" ? "snippets" : type],
          ],
        }))
      }

      setPage(pageNum)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    if (query.trim()) {
      performSearch(query, newTab, language, sortBy, 1)
    }
    updateURL(query, newTab, language, sortBy)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "language") {
      setLanguage(value)
    } else if (filterType === "sort") {
      setSortBy(value)
    }

    if (query.trim()) {
      performSearch(
        query,
        activeTab,
        filterType === "language" ? value : language,
        filterType === "sort" ? value : sortBy,
        1,
      )
    }
    updateURL(query, activeTab, filterType === "language" ? value : language, filterType === "sort" ? value : sortBy)
  }

  const updateURL = (q: string, type: string, lang: string, sort: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (type !== "all") params.set("type", type)
    if (lang !== "all") params.set("language", lang)
    if (sort !== "relevance") params.set("sort", sort)

    router.push(`/search?${params.toString()}`, { scroll: false })
  }

  const loadMore = () => {
    if (query.trim()) {
      performSearch(query, activeTab, language, sortBy, page + 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search snippets, users, and tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>

          <div className="flex gap-2">
            <Select value={language} onValueChange={(value) => handleFilterChange("language", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {query && <p className="text-muted-foreground">{loading ? "Searching..." : `Search results for "${query}"`}</p>}
      </div>

      {/* Search Results */}
      {query.trim() ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="snippets">
              <Code className="w-4 h-4 mr-2" />
              Snippets ({results.snippets?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users ({results.users?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Hash className="w-4 h-4 mr-2" />
              Tags ({results.tags?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-8">
              {/* Snippets Section */}
              {results.snippets?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Snippets</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.snippets.slice(0, 6).map((snippet: any) => (
                      <SnippetCard key={snippet.id} snippet={snippet} />
                    ))}
                  </div>
                  {results.snippets.length > 6 && (
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => handleTabChange("snippets")}
                    >
                      View all snippets
                    </Button>
                  )}
                </div>
              )}

              {/* Users Section */}
              {results.users?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Users</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.users.slice(0, 6).map((user: any) => (
                      <Card key={user.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.image || ""} alt={user.name} />
                              <AvatarFallback>{user.name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Link href={`/${user.username}`} className="font-medium hover:underline">
                                {user.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                              {user.bio && <p className="text-xs text-muted-foreground mt-1">{user.bio}</p>}
                              <p className="text-xs text-muted-foreground mt-1">
                                {user._count.snippets} snippets • {user._count.followers} followers
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {results.tags?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.slice(0, 10).map((tag: any) => (
                      <Link key={tag.id} href={`/discover?tag=${tag.name}`}>
                        <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
                          #{tag.name} ({tag._count.snippets})
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="snippets" className="mt-6">
            {results.snippets?.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.snippets.map((snippet: any) => (
                    <SnippetCard key={snippet.id} snippet={snippet} />
                  ))}
                </div>
                {results.total > results.snippets.length && (
                  <div className="text-center">
                    <Button onClick={loadMore} disabled={loading}>
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No snippets found for "{query}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {results.users?.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.users.map((user: any) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image || ""} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Link href={`/${user.username}`} className="font-medium hover:underline">
                              {user.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            {user.bio && <p className="text-xs text-muted-foreground mt-1">{user.bio}</p>}
                            <p className="text-xs text-muted-foreground mt-1">
                              {user._count.snippets} snippets • {user._count.followers} followers
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {results.total > results.users.length && (
                  <div className="text-center">
                    <Button onClick={loadMore} disabled={loading}>
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found for "{query}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            {results.tags?.length > 0 ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {results.tags.map((tag: any) => (
                    <Link key={tag.id} href={`/discover?tag=${tag.name}`}>
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{tag.name}</span>
                            <Badge variant="secondary">{tag._count.snippets}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {results.total > results.tags.length && (
                  <div className="text-center">
                    <Button onClick={loadMore} disabled={loading}>
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tags found for "{query}"</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Search Codegram</h3>
          <p className="text-muted-foreground">Find snippets, users, and tags</p>
        </div>
      )}
    </div>
  )
}
