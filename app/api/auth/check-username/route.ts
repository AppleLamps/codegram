import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    return NextResponse.json({ available: !existingUser })
  } catch (error) {
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
