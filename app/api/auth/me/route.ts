import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ user: null })
  }
}
