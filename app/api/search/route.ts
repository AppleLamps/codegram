import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all" // all, snippets, users, tags
    const language = searchParams.get("language")
    const sortBy = searchParams.get("sort") || "relevance" // relevance, recent, popular
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const results: any = {
      snippets: [],
      users: [],
      tags: [],
      total: 0,
    }

    // Search snippets
    if (type === "all" || type === "snippets") {
      const snippetWhere: any = {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
        isPublic: true,
      }

      if (language) {
        snippetWhere.language = language
      }

      let orderBy: any = { createdAt: "desc" }
      if (sortBy === "popular") {
        orderBy = { likes: { _count: "desc" } }
      }

      const snippets = await prisma.snippet.findMany({
        where: snippetWhere,
        include: {
          author: {
            select: { id: true, username: true, name: true, image: true },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      })

      results.snippets = snippets
    }

    // Search users
    if (type === "all" || type === "users") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          _count: {
            select: { snippets: true, followers: true },
          },
        },
        take: type === "users" ? limit : 5,
        skip: type === "users" ? offset : 0,
      })

      results.users = users
    }

    // Search tags
    if (type === "all" || type === "tags") {
      const tags = await prisma.tag.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        include: {
          _count: {
            select: { snippets: true },
          },
        },
        take: type === "tags" ? limit : 5,
        skip: type === "tags" ? offset : 0,
      })

      results.tags = tags
    }

    // Calculate total for pagination
    if (type !== "all") {
      let totalCount: number;
      if (type === "snippets") {
        const countWhere: any = {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { code: { contains: query, mode: "insensitive" } },
          ],
          isPublic: true,
        }
        
        if (language) {
          countWhere.language = language
        }
        
        totalCount = await prisma.snippet.count({
          where: countWhere,
        });
      } else if (type === "users") {
        totalCount = await prisma.user.count({
          where: {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
              { bio: { contains: query, mode: "insensitive" } },
            ],
          },
        });
      } else {
         totalCount = await prisma.tag.count({
           where: {
             name: { contains: query, mode: "insensitive" },
           },
         });
       }
      results.total = totalCount
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
