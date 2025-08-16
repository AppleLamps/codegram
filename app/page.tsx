"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Feed } from "@/components/feed"
import { PageLoading } from "@/components/ui/loading"
import { useUser } from "@stackframe/stack"

export default function HomePage() {
  const user = useUser()
  const status = user ? "authenticated" : "loading"
  const searchParams = useSearchParams()
  const [feedType, setFeedType] = useState<"trending" | "following" | "recent" | "popular">("trending")

  useEffect(() => {
    const type = searchParams.get("type") as any
    if (type && ["trending", "following", "recent", "popular"].includes(type)) {
      setFeedType(type)
    }
  }, [searchParams])

  if (status === "loading") {
    return <PageLoading message="Loading Codegram..." />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="space-content">
        <div className="feed-container">
          <Feed initialType={feedType} />
        </div>
      </main>
    </div>
  )
}
