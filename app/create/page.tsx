"use client"

import type React from "react"
import { useState } from "react"
import { useUser } from "@stackframe/stack"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CodeEditor } from "@/components/code-editor"
import { SyntaxHighlighter } from "@/components/syntax-highlighter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { X, Plus, AlertCircle } from "lucide-react"

export default function CreateSnippet() {
  const user = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    isPublic: true,
  })

  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  if (!user) {
    router.push("/handler/sign-in")
    return null
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.code.trim()) return

    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags }),
      })

      if (response.ok) {
        const snippet = await response.json()
        router.push(`/snippet/${snippet.id}`)
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to create snippet" }))
        setError(errorData.message || "Failed to create snippet. Please try again.")
      }
    } catch (error) {
      console.error("Failed to create snippet:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Snippet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Create new code snippet">
            <fieldset className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your snippet a descriptive title"
                required
                aria-required="true"
                aria-describedby={error ? "form-error" : undefined}
                className="focus-ring"
              />
            </fieldset>

            <fieldset className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your code does (optional)"
                rows={3}
                aria-describedby="description-help"
                className="focus-ring"
              />
              <p id="description-help" className="text-sm text-muted-foreground">Optional description to help others understand your code</p>
            </fieldset>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <CodeEditor
                  value={formData.code}
                  onChange={(code) => setFormData({ ...formData, code })}
                  language={formData.language}
                  onLanguageChange={(language) => setFormData({ ...formData, language })}
                  placeholder="Paste or type your code here..."
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{formData.language}</Badge>
                  </div>
                  <SyntaxHighlighter
                    code={formData.code || "// Your code will appear here"}
                    language={formData.language}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tags (optional)</legend>
              <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Current tags">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1" role="listitem">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)} 
                      className="ml-1 focus-ring rounded" 
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="new-tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  maxLength={20}
                  aria-describedby="tags-help"
                  aria-label="New tag input"
                  className="focus-ring"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  variant="outline" 
                  size="sm" 
                  disabled={tags.length >= 5}
                  aria-label="Add tag"
                  className="focus-ring"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <p id="tags-help" className="text-sm text-muted-foreground">Add up to 5 tags to help others discover your snippet</p>
            </fieldset>

            <fieldset className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                aria-describedby="public-help"
              />
              <Label htmlFor="public">Make this snippet public</Label>
              <p id="public-help" className="sr-only">Toggle to make your snippet visible to all users or keep it private</p>
            </fieldset>

            {error && (
              <div 
                id="form-error"
                role="alert" 
                aria-live="polite"
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
              >
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.code.trim()}>
                {isSubmitting ? "Creating..." : "Create Snippet"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
