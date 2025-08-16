import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"
import DOMPurify from "dompurify"
import { JSDOM } from "jsdom"

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = token ? await getCurrentUser(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { username, bio, website, location } = await request.json()

    // Create a DOM window for DOMPurify
    const window = new JSDOM('').window
    const purify = DOMPurify(window)

    // Sanitize user inputs
    const sanitizedBio = bio ? purify.sanitize(bio) : null
    const sanitizedWebsite = website ? purify.sanitize(website) : null
    const sanitizedLocation = location ? purify.sanitize(location) : null

    // Check if username is available
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: "Invalid username or username unavailable" }, { status: 400 })
    }

    // Update user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        bio: sanitizedBio,
        website: sanitizedWebsite,
        location: sanitizedLocation,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
