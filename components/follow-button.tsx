"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  username: string
  initialFollowing?: boolean
  onFollowChange?: (following: boolean) => void
}

export function FollowButton({ username, initialFollowing = false, onFollowChange }: FollowButtonProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.following)
        onFollowChange?.(data.following)
      }
    } catch (error) {
      console.error("Follow error:", error)
    }
    setIsLoading(false)
  }

  if (!session) return null

  return (
    <Button onClick={handleFollow} disabled={isLoading} variant={isFollowing ? "outline" : "default"} size="sm">
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}
