"use client"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/loading"
import { TrendingUp, Code, Hash, Users } from "lucide-react"
import Link from "next/link"

export default function DiscoverPage() {
  const [languages, setLanguages] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscoverData()
  }, [])

  const fetchDiscoverData = async () => {
    try {
      const [languagesRes, tagsRes] = await Promise.all([fetch("/api/discover/languages"), fetch("/api/discover/tags")])

      if (languagesRes.ok) {
        const languagesData = await languagesRes.json()
        setLanguages(languagesData)
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData)
      }
    } catch (error) {
      console.error("Failed to fetch discover data:", error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Languages skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Tags skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-16 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="space-content" role="main">
        <div className="container mx-auto px-4">
          <header className="space-section">
            <h1 className="text-display font-bold mb-2">Discover</h1>
            <p className="text-muted-foreground text-body-large">
              Explore trending languages, popular tags, and discover new code snippets
            </p>
          </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section aria-labelledby="popular-languages-title">
            <Card>
              <CardHeader>
                <CardTitle id="popular-languages-title" className="flex items-center gap-2">
                  <Code className="h-5 w-5" aria-hidden="true" />
                  Popular Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav aria-label="Popular programming languages">
                  <ol className="space-y-3" role="list">
                    {languages.slice(0, 10).map((language, index) => (
                      <li key={language.name} className="flex items-center justify-between" role="listitem">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6" aria-label={`Rank ${index + 1}`}>#{index + 1}</span>
                          <Button variant="ghost" size="sm" asChild className="h-auto p-0 font-medium focus-ring">
                            <Link href={`/?language=${language.name}`} aria-label={`View ${language.name} snippets`}>{language.name}</Link>
                          </Button>
                        </div>
                        <Badge variant="secondary" aria-label={`${language.count} code snippets`}>{language.count} snippets</Badge>
                      </li>
                    ))}
                  </ol>
                </nav>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="trending-tags-title">
            <Card>
              <CardHeader>
                <CardTitle id="trending-tags-title" className="flex items-center gap-2">
                  <Hash className="h-5 w-5" aria-hidden="true" />
                  Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav aria-label="Trending tags">
                  <div className="flex flex-wrap gap-2" role="list">
                    {tags.slice(0, 20).map((tag) => (
                      <Button key={tag.id} variant="outline" size="sm" asChild className="focus-ring" role="listitem">
                        <Link href={`/?tag=${tag.name}`} aria-label={`View snippets tagged with ${tag.name}, ${tag._count.snippets} snippets available`}>
                          #{tag.name}
                          <Badge variant="secondary" className="ml-2" aria-hidden="true">
                            {tag._count.snippets}
                          </Badge>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </nav>
              </CardContent>
            </Card>
          </section>
        </div>

        <section className="mt-8" aria-labelledby="quick-actions-title">
          <Card>
            <CardHeader>
              <CardTitle id="quick-actions-title" className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <nav aria-label="Quick navigation actions">
                <div className="grid gap-4 md:grid-cols-3" role="list">
                  <Button asChild className="h-auto p-4 flex-col gap-2 focus-ring" role="listitem">
                    <Link href="/?type=trending" aria-label="View trending code snippets">
                      <TrendingUp className="h-6 w-6" aria-hidden="true" />
                      <span>View Trending</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent focus-ring" role="listitem">
                    <Link href="/?type=popular" aria-label="View most popular code snippets">
                      <Users className="h-6 w-6" aria-hidden="true" />
                      <span>Most Popular</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent focus-ring" role="listitem">
                    <Link href="/?type=recent" aria-label="View latest code snippets">
                      <Code className="h-6 w-6" aria-hidden="true" />
                      <span>Latest Snippets</span>
                    </Link>
                  </Button>
                </div>
              </nav>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
