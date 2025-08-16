"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@stackframe/stack"
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
import { Spinner } from "@/components/ui/loading"
import { Search, Plus, Bell, User, LogOut, Settings, Hash } from "lucide-react"

export function Header() {
  const user = useUser()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
    }
  }, [user])

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
      setLoadingSuggestions(false)
      return
    }

    setLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Error fetching search suggestions:", error)
      setSearchSuggestions([])
    } finally {
      setLoadingSuggestions(false)
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
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg shadow-primary/5" role="banner">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="container relative flex h-20 items-center px-4 md:px-6">
        <div className="mr-6 md:mr-8 flex">
          <Link 
            href="/" 
            className="group flex items-center space-x-4 hover-lift transition-all duration-300 focus-ring rounded-xl p-2 -m-2"
            aria-label="Codegram - Go to homepage"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300" aria-hidden="true" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
              <div className="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/40" />
            </div>
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent group-hover:from-primary/90 group-hover:to-secondary/90 transition-all duration-300">Codegram</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-3 md:space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none search-input" ref={searchRef} role="search">
            <div className="relative">
              <form onSubmit={handleSearchSubmit} role="search">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder="Search snippets, users, tags..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSuggestions(false)
                        e.currentTarget.blur()
                      }
                    }}
                    className="pl-12 pr-6 py-3.5 text-base w-full md:w-[380px] lg:w-[480px] focus-ring bg-gradient-to-r from-muted/40 to-muted/20 border-border/30 hover:border-border/50 focus:border-primary/50 hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-300 rounded-2xl shadow-sm focus:shadow-lg focus:shadow-primary/10 backdrop-blur-sm"
                    aria-label="Search for snippets, users, or tags"
                    aria-expanded={showSuggestions && (searchQuery.length >= 2 || loadingSuggestions)}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && (searchQuery.length >= 2 || loadingSuggestions) && (
                <div 
                  className="absolute top-full left-0 right-0 mt-3 bg-background/98 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl shadow-primary/10 z-50 max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-300 ring-1 ring-primary/5"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-6" role="status" aria-live="polite">
                      <Spinner size="sm" aria-hidden="true" />
                      <span className="ml-3 text-sm text-muted-foreground">Searching...</span>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <div className="py-2" role="group" aria-label="Search results">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSuggestionClick(suggestion)
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-muted/80 focus:bg-muted/80 focus:outline-none focus-ring transition-all duration-150 flex items-center gap-3 text-sm border-b border-border/50 last:border-b-0 hover-lift"
                          role="option"
                          aria-label={`${suggestion.type === 'user' ? 'User' : suggestion.type === 'snippet' ? 'Code snippet' : 'Tag'}: ${suggestion.name || suggestion.value}`}
                        >
                          {suggestion.type === "user" && (
                            <>
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground">{suggestion.name || suggestion.value}</div>
                                <div className="text-muted-foreground text-xs">@{suggestion.value}</div>
                              </div>
                            </>
                          )}
                          {suggestion.type === "snippet" && (
                            <>
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <Search className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium">{suggestion.value}</div>
                                <div className="text-muted-foreground text-xs">Code snippet</div>
                              </div>
                              <Badge variant="secondary" className="text-xs flex-shrink-0 bg-muted">
                                {suggestion.language}
                              </Badge>
                            </>
                          )}
                          {suggestion.type === "tag" && (
                            <>
                              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                <Hash className="w-4 h-4 text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">#{suggestion.value}</div>
                                <div className="text-muted-foreground text-xs">{suggestion.count} snippets</div>
                              </div>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center" role="status" aria-live="polite">
                      <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" aria-hidden="true" />
                      <div className="text-sm text-muted-foreground">
                        No results found for <span className="font-medium">"{searchQuery}"</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="flex items-center space-x-3 md:space-x-5 header-nav" role="navigation" aria-label="Main navigation">
            {user ? (
              <>
                <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl px-6 py-2.5 font-medium hidden sm:flex group" asChild>
                  <Link href="/create" aria-label="Create new snippet" className="flex items-center space-x-2.5">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
                    <span>Create</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" className="relative h-11 w-11 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/20 hover:border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group" asChild>
                  <Link href="/notifications" aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}>
                    <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse shadow-lg ring-2 ring-background"
                        aria-label={`${unreadCount > 99 ? '99+' : unreadCount} unread notifications`}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative h-11 w-11 rounded-xl p-0 ring-2 ring-transparent hover:ring-primary/30 focus:ring-primary/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg"
                      aria-label={`User menu for ${user.displayName || user.primaryEmail}`}
                      aria-haspopup="menu"
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-background shadow-md">
                        <AvatarImage src={user.profileImageUrl || ""} alt={`${user.displayName || user.primaryEmail} profile picture`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground font-semibold text-sm">
                          {user.displayName?.charAt(0) || user.primaryEmail?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 p-3 bg-background/98 backdrop-blur-xl border border-border/20 shadow-2xl shadow-primary/10 rounded-2xl" align="end" forceMount role="menu" aria-label="User account menu">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-2" role="presentation">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImageUrl || ""} alt={`${user.displayName || user.primaryEmail} profile picture`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                          {user.displayName?.charAt(0) || user.primaryEmail?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none flex-1 min-w-0">
                        {user.displayName && <p className="font-semibold text-sm">{user.displayName}</p>}
                        {user.primaryEmail && (
                          <p className="truncate text-xs text-muted-foreground">{user.primaryEmail}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile`} role="menuitem">
                        <User className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/settings`} role="menuitem">
                        <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => user.signOut()} role="menuitem">
                        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl px-6 py-2.5 font-medium group" asChild>
                <Link href="/auth/signin" aria-label="Sign in to your account" className="flex items-center space-x-2">
                  <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                  <span>Sign In</span>
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
