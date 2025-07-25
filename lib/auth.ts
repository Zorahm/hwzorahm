import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Простой секретный ключ
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Предустановленные учетные данные админа
const ADMIN_EMAIL = "admin"
const ADMIN_PASSWORD = "ioBFjYOACC6f2r44" // Новый пароль

export interface JwtPayload {
  userId: number
  email: string
  role: string
}

export async function generateToken(userId: number, email: string, role: string): Promise<string> {
  // Простая функция для создания токена без использования jsonwebtoken
  const payload = { userId, email, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    // Простая функция для проверки токена без использования jsonwebtoken
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    // Проверка истечения срока действия
    if (payload.exp < Date.now()) {
      return null
    }

    return payload as JwtPayload
  } catch (error) {
    return null
  }
}

export async function getUser(req: NextRequest): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const user = await getUser(req)
  return user?.role === "admin"
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// Функция для проверки учетных данных админа
export function checkAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

// Добавляем функцию getServerSession для совместимости
export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    // Проверка истечения срока действия
    if (payload.exp < Date.now()) {
      return null
    }

    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    }
  } catch (error) {
    return null
  }
}
