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
    const { title, description, code, language, isPublic, tags } = await request.json()

    // Create snippet
    const snippet = await prisma.snippet.create({
      data: {
        title,
        description: description || null,
        code,
        language,
        isPublic,
        authorId: user.id,
      },
    })

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await prisma.tag.findUnique({
          where: { name: tagName.toLowerCase() },
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName.toLowerCase() },
          })
        }

        // Link tag to snippet
        await prisma.snippetTag.create({
          data: {
            snippetId: snippet.id,
            tagId: tag.id,
          },
        })
      }
    }

    return NextResponse.json(snippet)
  } catch (error) {
    console.error("Snippet creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  try {
    const snippets = await prisma.snippet.findMany({
      where: { isPublic: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            forks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Transform the data
    const transformedSnippets = snippets.map((snippet) => ({
      ...snippet,
      tags: snippet.tags.map((st) => st.tag),
    }))

    return NextResponse.json(transformedSnippets)
  } catch (error) {
    console.error("Snippets fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
