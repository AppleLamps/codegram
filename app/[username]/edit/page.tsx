"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@stackframe/stack"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditProfilePage() {
  const user = useUser()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    location: "",
  })

  useEffect(() => {
    if (user?.primaryEmail !== username) {
      router.push(`/${username}`)
      return
    }

    fetchUserProfile()
  }, [user, username])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      if (response.ok) {
        const user = await response.json()
        setFormData({
          name: user.name || "",
          bio: user.bio || "",
          website: user.website || "",
          location: user.location || "",
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/users/${username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/${username}`)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${username}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Edit profile information">
            {/* Profile Picture */}
            <fieldset className="flex items-center gap-4">
              <legend className="sr-only">Profile Picture</legend>
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.profileImageUrl || ""} alt={formData.name} />
                <AvatarFallback className="text-xl">
                  {formData.name?.charAt(0) || user?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  Profile picture is managed through your authentication provider
                </p>
              </div>
            </fieldset>

            {/* Name */}
            <fieldset className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your display name"
                maxLength={50}
                aria-describedby="name-help"
                className="focus-ring"
              />
              <p id="name-help" className="text-sm text-muted-foreground">Your public display name (up to 50 characters)</p>
            </fieldset>

            {/* Bio */}
            <fieldset className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={160}
                aria-describedby="bio-help"
                className="focus-ring"
              />
              <p id="bio-help" className="text-xs text-muted-foreground">{formData.bio.length}/160 characters</p>
            </fieldset>

            {/* Website */}
            <fieldset className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                aria-describedby="website-help"
                className="focus-ring"
              />
              <p id="website-help" className="text-sm text-muted-foreground">Optional: Your personal or professional website</p>
            </fieldset>

            {/* Location */}
            <fieldset className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, Country"
                maxLength={30}
                aria-describedby="location-help"
                className="focus-ring"
              />
              <p id="location-help" className="text-sm text-muted-foreground">Optional: Where you're based (up to 30 characters)</p>
            </fieldset>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/${username}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
