"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Code2, Check, X } from "lucide-react"

export default function Onboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    website: "",
    location: "",
  })
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus("idle")
      return
    }

    setUsernameStatus("checking")
    try {
      const response = await fetch(`/api/auth/check-username?username=${username}`)
      const data = await response.json()
      setUsernameStatus(data.available ? "available" : "taken")
    } catch (error) {
      setUsernameStatus("idle")
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
    setFormData({ ...formData, username })

    if (username !== formData.username) {
      checkUsername(username)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus !== "available") return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Profile completion failed:", error)
    }
    setIsSubmitting(false)
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Code2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Set up your Codegram profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  required
                  minLength={3}
                  maxLength={20}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                  {usernameStatus === "available" && <Check className="h-4 w-4 text-green-500" />}
                  {usernameStatus === "taken" && <X className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {usernameStatus === "taken" && <p className="text-sm text-red-500">Username is already taken</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={usernameStatus !== "available" || isSubmitting}>
              {isSubmitting ? "Creating Profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
