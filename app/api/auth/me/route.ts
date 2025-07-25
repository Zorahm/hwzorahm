import { type NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ authenticated: false, error: "Ошибка проверки аутентификации" })
  }
}
