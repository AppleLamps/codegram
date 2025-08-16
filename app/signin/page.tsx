"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Welcome back to Codegram</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Sign in to your account">
            <fieldset>
              <legend className="sr-only">Account Credentials</legend>
              <div className="space-y-4">
                <div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email address"
                    aria-describedby={error ? "form-error" : undefined}
                    className="focus-ring"
                  />
                </div>
                <div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-label="Password"
                    aria-describedby={error ? "form-error" : undefined}
                    className="focus-ring"
                  />
                </div>
              </div>
            </fieldset>
            {error && (
              <div id="form-error" role="alert" aria-live="polite" className="text-sm text-red-500">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full focus-ring" disabled={loading} aria-describedby={loading ? "loading-status" : undefined}>
              {loading ? "Signing In..." : "Sign In"}
              {loading && <span id="loading-status" className="sr-only">Please wait while we sign you in</span>}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/signup" className="text-sm text-muted-foreground hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
