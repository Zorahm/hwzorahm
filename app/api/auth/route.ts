import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// Моковая функция для генерации токена (в реальном приложении используйте JWT)
function generateToken(userId: number, role: string): string {
  return Buffer.from(JSON.stringify({ 
    userId, 
    role, 
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // UNIX timestamp
  })).toString('base64')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email и пароль обязательны" },
        { status: 400 }
      )
    }

    // Попробуем найти пользователя в базе данных
    let user = null

    try {
      user = await prisma.user.findUnique({
        where: { email },
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Fallback аутентификация с явными паролями (только для разработки!)
      const fallbackUsers = {
        'admin': {
          password: 'ioBFjYOACC6f2r44', // Пароль админа
          role: 'admin',
          id: 1
        },
        'student@college.ru': {
          password: 'student123',
          role: 'student',
          id: 2
        },
        'kozlopuch': {
          password: 'special123',
          role: 'special',
          id: 3
        }
      }

      const fallbackUser = fallbackUsers[email as keyof typeof fallbackUsers]
      
      if (fallbackUser && password === fallbackUser.password) {
        const token = generateToken(fallbackUser.id, fallbackUser.role)

        cookies().set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        })

        return NextResponse.json({
          success: true,
          user: {
            id: fallbackUser.id,
            email,
            role: fallbackUser.role,
          },
        })
      }

      return NextResponse.json(
        { success: false, message: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    // В реальном приложении здесь должна быть проверка хэша пароля!
    if (password !== user.password) {
      return NextResponse.json(
        { success: false, message: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    // Генерируем токен
    const token = generateToken(user.id, user.role)

    // Устанавливаем cookie
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка сервера" },
      { status: 500 }
    )
  }
}