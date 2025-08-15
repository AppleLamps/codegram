"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Code2 } from "lucide-react"
import Link from "next/link"

export default function SignIn() {
  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl: "/auth/onboarding" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Code2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Codegram</CardTitle>
          <CardDescription>Sign in to share and discover amazing code snippets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGitHubSignIn} variant="outline" className="w-full bg-transparent" size="lg">
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
