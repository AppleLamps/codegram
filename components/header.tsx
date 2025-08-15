"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, Plus, Bell, User, LogOut, Settings } from "lucide-react"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount()
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?unread=true")
      const data = await response.json()
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const fetchSearchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Error fetching search suggestions:", error)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(true)
    fetchSearchSuggestions(value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === "user") {
      router.push(`/${suggestion.value}`)
    } else if (suggestion.type === "snippet") {
      router.push(`/snippet/${suggestion.id}`)
    } else if (suggestion.type === "tag") {
      router.push(`/discover?tag=${suggestion.value}`)
    }
    setShowSuggestions(false)
    setSearchQuery("")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-primary" />
            <span className="font-bold">Codegram</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none" ref={searchRef}>
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search snippets, users, tags..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-8 md:w-[300px] lg:w-[400px]"
                />
              </form>

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm"
                    >
                      {suggestion.type === "user" && (
                        <>
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{suggestion.name || suggestion.value}</span>
                          <span className="text-muted-foreground">@{suggestion.value}</span>
                        </>
                      )}
                      {suggestion.type === "snippet" && (
                        <>
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <span>{suggestion.value}</span>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.language}
                          </Badge>
                        </>
                      )}
                      {suggestion.type === "tag" && (
                        <>
                          <span className="text-muted-foreground">#</span>
                          <span>{suggestion.value}</span>
                          <span className="text-muted-foreground text-xs">({suggestion.count})</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            {session?.user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Create snippet</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" className="relative" asChild>
                  <Link href="/notifications">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) || session.user.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user.name && <p className="font-medium">{session.user.name}</p>}
                        {session.user.username && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">@{session.user.username}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/${session.user.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${session.user.username}/edit`}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
