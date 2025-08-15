import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const languages = await prisma.snippet.groupBy({
      by: ["language"],
      where: { isPublic: true },
      _count: {
        language: true,
      },
      orderBy: {
        _count: {
          language: "desc",
        },
      },
      take: 20,
    })

    const formattedLanguages = languages.map((lang) => ({
      name: lang.language,
      count: lang._count.language,
    }))

    return NextResponse.json(formattedLanguages)
  } catch (error) {
    console.error("Languages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
