"use client"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-muted-foreground">
            Explore trending languages, popular tags, and discover new code snippets
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Popular Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {languages.slice(0, 10).map((language, index) => (
                  <div key={language.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                      <Button variant="ghost" size="sm" asChild className="h-auto p-0 font-medium">
                        <Link href={`/?language=${language.name}`}>{language.name}</Link>
                      </Button>
                    </div>
                    <Badge variant="secondary">{language.count} snippets</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Trending Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 20).map((tag) => (
                  <Button key={tag.id} variant="outline" size="sm" asChild>
                    <Link href={`/?tag=${tag.name}`}>
                      #{tag.name}
                      <Badge variant="secondary" className="ml-2">
                        {tag._count.snippets}
                      </Badge>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button asChild className="h-auto p-4 flex-col gap-2">
                  <Link href="/?type=trending">
                    <TrendingUp className="h-6 w-6" />
                    <span>View Trending</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                  <Link href="/?type=popular">
                    <Users className="h-6 w-6" />
                    <span>Most Popular</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                  <Link href="/?type=recent">
                    <Code className="h-6 w-6" />
                    <span>Latest Snippets</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
