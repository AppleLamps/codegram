"use client"
import { useState } from "react"
import { useUser } from "@stackframe/stack"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  username: string
  initialFollowing?: boolean
  onFollowChange?: (following: boolean) => void
}

export function FollowButton({ username, initialFollowing = false, onFollowChange }: FollowButtonProps) {
  const user = useUser()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (!user) return

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

  if (!user) return null

  return (
    <Button 
      onClick={handleFollow} 
      disabled={isLoading} 
      variant="ghost"
      size="sm"
      className={`relative h-8 px-4 text-xs font-semibold transition-all duration-300 hover-lift focus-ring rounded-lg group/follow overflow-hidden border ${
        isFollowing 
          ? 'text-green-700 dark:text-green-300 bg-gradient-to-r from-green-50/80 to-emerald-50/60 hover:from-green-100/90 hover:to-emerald-100/70 dark:from-green-950/40 dark:to-emerald-950/30 dark:hover:from-green-950/60 dark:hover:to-emerald-950/40 border-green-200/70 hover:border-green-300/90 dark:border-green-800/50 dark:hover:border-green-700/70 shadow-sm hover:shadow-md' 
          : 'text-white bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary border-primary/30 hover:border-primary/50 shadow-md hover:shadow-lg hover:shadow-primary/20'
      }`}
      aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${username}`}
      aria-pressed={isFollowing}
    >
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isFollowing 
          ? 'bg-gradient-to-r from-green-400/5 to-emerald-400/5 opacity-0 group-hover/follow:opacity-100'
          : 'bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover/follow:opacity-100'
      }`} />
      {isFollowing ? (
        <>
          <UserMinus className="h-3 w-3 mr-1.5 relative z-10 transition-all duration-300 group-hover/follow:scale-110" aria-hidden="true" />
          <span className="relative z-10">Following</span>
        </>
      ) : (
        <>
          <UserPlus className="h-3 w-3 mr-1.5 relative z-10 transition-all duration-300 group-hover/follow:scale-110" aria-hidden="true" />
          <span className="relative z-10">Follow</span>
        </>
      )}
    </Button>
  )
}
