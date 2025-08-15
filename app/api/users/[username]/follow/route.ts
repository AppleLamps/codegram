import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  const token = request.cookies.get("auth-token")?.value
  const follower = token ? await getCurrentUser(token) : null

  if (!follower) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const following = await prisma.user.findUnique({
      where: { username: params.username },
    })

    if (!following) {
      return NextResponse.json({ error: "User to follow not found" }, { status: 404 })
    }

    if (follower.id === following.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      })

      return NextResponse.json({ following: false })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: following.id,
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          type: "FOLLOW",
          message: `${follower.name || follower.username} started following you`,
          userId: following.id,
        },
      })

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error("Follow error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
