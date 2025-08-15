import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get popular tags
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      include: {
        _count: { select: { snippets: true } },
      },
      orderBy: {
        snippets: { _count: "desc" },
      },
      take: 3,
    })

    // Get popular users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        username: true,
        name: true,
        image: true,
        _count: { select: { followers: true } },
      },
      orderBy: {
        followers: { _count: "desc" },
      },
      take: 3,
    })

    // Get recent popular snippets
    const snippets = await prisma.snippet.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        language: true,
      },
      orderBy: {
        likes: { _count: "desc" },
      },
      take: 3,
    })

    const suggestions = [
      ...tags.map((tag) => ({ type: "tag", value: tag.name, count: tag._count.snippets })),
      ...users.map((user) => ({ type: "user", value: user.username, name: user.name, image: user.image })),
      ...snippets.map((snippet) => ({
        type: "snippet",
        value: snippet.title,
        id: snippet.id,
        language: snippet.language,
      })),
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error getting search suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
