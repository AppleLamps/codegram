"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageCircle, UserPlus, Code, Check, CheckCheck } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  fromUser: {
    id: string
    username: string
    name: string
    image?: string
  }
  snippet?: {
    id: string
    title: string
    language: string
  }
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session, filter])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === "unread") params.append("unread", "true")

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds,
          markAsRead: true,
        }),
      })

      fetchNotifications()
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const markAllAsRead = () => {
    markAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "remix":
        return <Code className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <p className="text-muted-foreground">You need to be signed in to view notifications.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${!notification.read ? "bg-muted/50 border-primary/20" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notification.fromUser.image || ""} alt={notification.fromUser.name} />
                    <AvatarFallback>
                      {notification.fromUser.name?.charAt(0) || notification.fromUser.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm">
                          <Link href={`/${notification.fromUser.username}`} className="font-medium hover:underline">
                            {notification.fromUser.name}
                          </Link>{" "}
                          {notification.message}
                          {notification.snippet && (
                            <>
                              {" "}
                              <Link
                                href={`/snippet/${notification.snippet.id}`}
                                className="font-medium hover:underline"
                              >
                                {notification.snippet.title}
                              </Link>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead([notification.id])}>
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {notification.snippet && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {notification.snippet.language}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "You're all caught up!"
              : "When people interact with your snippets, you'll see notifications here."}
          </p>
        </div>
      )}
    </div>
  )
}
