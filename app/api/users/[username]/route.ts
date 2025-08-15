import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const currentUser = token ? await getCurrentUser(token) : null
    const { username } = params

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        snippets: {
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
          orderBy: { createdAt: "desc" },
        },
        followers: {
          include: {
            follower: {
              select: { id: true, username: true, name: true, image: true },
            },
          },
        },
        following: {
          include: {
            following: {
              select: { id: true, username: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: {
            snippets: true,
            followers: true,
            following: true,
            likes: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if current user is following this user
    let isFollowing = false
    if (currentUser?.id) {
      const followRelation = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: user.id,
          },
        },
      })
      isFollowing = !!followRelation
    }

    return NextResponse.json({
      ...user,
      isFollowing,
      isOwnProfile: currentUser?.id === user.id,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const currentUser = token ? await getCurrentUser(token) : null

    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = params
    const body = await request.json()
    const { name, bio, website, location } = body

    // Check if user owns this profile
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user || user.id !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        bio,
        website,
        location,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
