"use client"

import { SignIn } from "@stackframe/stack"
import { Code2 } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Code2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Codegram</h1>
          <p className="text-muted-foreground mt-2">Sign in to share and discover amazing code snippets</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
