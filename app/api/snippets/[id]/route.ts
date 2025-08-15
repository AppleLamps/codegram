import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
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
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    // Transform the data
    const transformedSnippet = {
      ...snippet,
      tags: snippet.tags.map((st) => st.tag),
    }

    return NextResponse.json(transformedSnippet)
  } catch (error) {
    console.error("Snippet fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
