import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            snippets: true,
          },
        },
      },
      orderBy: {
        snippets: {
          _count: "desc",
        },
      },
      take: 30,
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Tags fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
