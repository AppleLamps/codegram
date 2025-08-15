import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("auth-token")?.value
  const user = token ? await getCurrentUser(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      include: { author: true },
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_snippetId: {
          userId: user.id,
          snippetId: params.id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          snippetId: params.id,
        },
      })

      // Create notification for snippet author (if not self-like)
      if (snippet.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            message: `${user.name || user.username} liked your snippet "${snippet.title}"`,
            userId: snippet.authorId,
            snippetId: params.id,
          },
        })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
