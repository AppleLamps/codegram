import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-simple"
import DOMPurify from "dompurify"
import { JSDOM } from "jsdom"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        snippetId: params.id,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Comments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("auth-token")?.value
  const user = token ? await getCurrentUser(token) : null

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content, parentId } = await request.json()

    // Create a DOM window for DOMPurify
    const window = new JSDOM('').window
    const purify = DOMPurify(window)

    // Sanitize comment content
    const sanitizedContent = content ? purify.sanitize(content) : ''

    if (!sanitizedContent?.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      include: { author: true },
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent.trim(),
        userId: user.id,
        snippetId: params.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notification for snippet author (if not self-comment)
    if (snippet.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          message: `${user.name || user.username} commented on your snippet "${snippet.title}"`,
          userId: snippet.authorId,
          snippetId: params.id,
        },
      })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
