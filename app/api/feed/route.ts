import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "trending"
  const language = searchParams.get("language")
  const tag = searchParams.get("tag")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 50)
  const skip = (page - 1) * limit

  const token = request.cookies.get("auth-token")?.value
  const user = token ? await getCurrentUser(token) : null

  try {
    const whereClause: any = { isPublic: true }
    let orderBy: any = { createdAt: "desc" }

    // Apply language filter
    if (language) {
      whereClause.language = language
    }

    // Apply tag filter
    if (tag) {
      whereClause.tags = {
        some: {
          tag: {
            name: tag.toLowerCase(),
          },
        },
      }
    }

    // Handle different feed types
    if (type === "following" && user?.id) {
      const followingUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          following: {
            select: { followingId: true },
          },
        },
      })

      if (followingUser) {
        whereClause.authorId = {
          in: followingUser.following.map((f) => f.followingId),
        }
      }
    } else if (type === "trending") {
      // For trending, we'll order by a combination of likes and recency
      orderBy = [
        {
          likes: {
            _count: "desc",
          },
        },
        { createdAt: "desc" },
      ]
    } else if (type === "popular") {
      // Popular: most liked overall
      orderBy = {
        likes: {
          _count: "desc",
        },
      }
    }

    const snippets = await prisma.snippet.findMany({
      where: whereClause,
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
        likes: user?.id
          ? {
              where: {
                user: {
                  id: user.id,
                },
              },
              select: { id: true },
            }
          : false,
      },
      orderBy,
      skip,
      take: limit,
    })

    // Transform the data
    const transformedSnippets = snippets.map((snippet) => ({
      ...snippet,
      tags: snippet.tags.map((st) => st.tag),
      isLiked: snippet.likes && snippet.likes.length > 0,
      likes: undefined, // Remove the likes array from response
    }))

    return NextResponse.json(transformedSnippets)
  } catch (error) {
    console.error("Feed fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
