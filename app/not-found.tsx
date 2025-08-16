"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6 space-y-6">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-heading-1 font-bold text-foreground">404</h1>
              <h2 className="text-heading-3 font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground text-body">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full hover-lift">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full hover-lift">
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                Search Snippets
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="w-full hover-lift"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}