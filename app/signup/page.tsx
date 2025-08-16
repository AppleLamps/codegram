"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up for Codegram</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Create a new account">
            <fieldset>
              <legend className="sr-only">Account Information</legend>
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
                    aria-describedby={error ? "form-error" : "email-help"}
                    className="focus-ring"
                  />
                  <p id="email-help" className="sr-only">Enter your email address for account creation</p>
                </div>
                <div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    aria-label="Username"
                    aria-describedby={error ? "form-error" : "username-help"}
                    className="focus-ring"
                  />
                  <p id="username-help" className="sr-only">Choose a unique username for your profile</p>
                </div>
                <div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    aria-label="Password"
                    aria-describedby={error ? "form-error" : "password-help"}
                    className="focus-ring"
                  />
                  <p id="password-help" className="sr-only">Password must be at least 6 characters long</p>
                </div>
              </div>
            </fieldset>
            {error && (
              <div id="form-error" role="alert" aria-live="polite" className="text-sm text-red-500">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full focus-ring" disabled={loading} aria-describedby={loading ? "loading-status" : undefined}>
              {loading ? "Creating Account..." : "Sign Up"}
              {loading && <span id="loading-status" className="sr-only">Please wait while we create your account</span>}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/signin" className="text-sm text-muted-foreground hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
