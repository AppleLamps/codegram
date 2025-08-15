import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-simple"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const user = token ? await getCurrentUser(token) : null

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unread") === "true"
    const offset = (page - 1) * limit

    const where: any = {
      userId: user.id,
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        fromUser: {
          select: { id: true, username: true, name: true, image: true },
        },
        snippet: {
          select: { id: true, title: true, language: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const user = token ? await getCurrentUser(token) : null

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAsRead } = body

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read/unread
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: { read: markAsRead },
      })
    } else {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false,
        },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
