import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = token ? await getCurrentUser(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { username, bio, website, location } = await request.json()

    // Check if username is available
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: "Username taken" }, { status: 400 })
    }

    // Update user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        bio: bio || null,
        website: website || null,
        location: location || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
