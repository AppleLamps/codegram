"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Feed } from "@/components/feed"
import { useSession } from "next-auth/react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [feedType, setFeedType] = useState<"trending" | "following" | "recent" | "popular">("trending")

  useEffect(() => {
    const type = searchParams.get("type") as any
    if (type && ["trending", "following", "recent", "popular"].includes(type)) {
      setFeedType(type)
    }
  }, [searchParams])

  if (status === "loading") {
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

      <main className="py-4">
        <div className="container mx-auto max-w-2xl px-4">
          <Feed initialType={feedType} />
        </div>
      </main>
    </div>
  )
}
