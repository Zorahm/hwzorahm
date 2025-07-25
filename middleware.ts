import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Проверяем маршруты админа и специальные маршруты
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/special")) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const user = await verifyToken(token)

      // Для админских маршрутов нужна роль admin
      if (request.nextUrl.pathname.startsWith("/admin") && (!user || user.role !== "admin")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Для специальных маршрутов нужна роль special
      if (request.nextUrl.pathname.startsWith("/special") && (!user || user.role !== "special")) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      console.error("Ошибка проверки токена:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/special/:path*"],
}