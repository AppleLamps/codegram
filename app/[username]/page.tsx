"use client"

import { useState, useEffect } from "react"
import { useUser } from "@stackframe/stack"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SnippetCard } from "@/components/snippet-card"
import { FollowButton } from "@/components/follow-button"
import { UserProfileSkeleton, SnippetCardSkeleton } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"
import { MapPin, LinkIcon, Calendar, Edit, UserX } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string
  name: string
  email: string
  image?: string
  bio?: string
  website?: string
  location?: string
  createdAt: string
  snippets: any[]
  followers: any[]
  following: any[]
  _count: {
    snippets: number
    followers: number
    following: number
    likes: number
  }
  isFollowing: boolean
  isOwnProfile: boolean
}

export default function UserProfilePage() {
  const currentUser = useUser()
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("snippets")

  useEffect(() => {
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <UserProfileSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-muted/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <UserX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-muted-foreground">The user you're looking for doesn't exist or may have been removed.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 mx-auto md:mx-0">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>

                <div className="flex gap-2">
                  {currentUser?.primaryEmail === user.email ? (
                    <Button variant="outline" asChild>
                      <Link href={`/${username}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <FollowButton
                      username={user.username}
                      initialFollowing={user.isFollowing}
                      onFollowChange={() => fetchUserProfile()}
                    />
                  )}
                </div>
              </div>

              {user.bio && <p className="text-sm mb-4">{user.bio}</p>}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold">{user._count.snippets}</span>
                  <span className="text-muted-foreground ml-1">snippets</span>
                </div>
                <div>
                  <span className="font-semibold">{user._count.followers}</span>
                  <span className="text-muted-foreground ml-1">followers</span>
                </div>
                <div>
                  <span className="font-semibold">{user._count.following}</span>
                  <span className="text-muted-foreground ml-1">following</span>
                </div>
                <div>
                  <span className="font-semibold">{user._count.likes}</span>
                  <span className="text-muted-foreground ml-1">likes</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="snippets" className="mt-6">
          {user.snippets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {user.snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="snippets"
              className="py-16"
              action={user.isOwnProfile ? {
                label: "Create your first snippet",
                href: "/create"
              } : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          {user.followers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.followers.map(({ follower }) => (
                <Card key={follower.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={follower.image || ""} alt={follower.name} />
                        <AvatarFallback>{follower.name?.charAt(0) || follower.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/${follower.username}`} className="font-medium hover:underline">
                          {follower.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{follower.username}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              type="followers"
              className="py-12"
            />
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          {user.following.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.following.map(({ following }) => (
                <Card key={following.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={following.image || ""} alt={following.name} />
                        <AvatarFallback>{following.name?.charAt(0) || following.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/${following.username}`} className="font-medium hover:underline">
                          {following.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{following.username}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              type="following"
              className="py-12"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
