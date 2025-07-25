import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { checkAdminCredentials, generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Проверка учетных данных админа
    if (checkAdminCredentials(email, password)) {
      // Создание токена для админа
      const token = await generateToken(1, email, "admin")

      // Установить куки
      const cookieStore = await cookies()
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      })

      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          email,
          role: "admin",
        },
      })
    }

    // Проверка учетных данных студента (для примера)
    if (email === "student" && password === "student123") {
      const token = await generateToken(2, email, "student")

      // Установить куки
      const cookieStore = await cookies()
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      })

      return NextResponse.json({
        success: true,
        user: {
          id: 2,
          email,
          role: "student",
        },
      })
    }

    // Неверные учетные данные
    return NextResponse.json(
      {
        success: false,
        error: "Неверный email или пароль",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка сервера при входе",
      },
      { status: 500 },
    )
  }
}
