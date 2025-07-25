import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/auth"

// GET /api/announcements - получить все объявления
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const searchParams = request.nextUrl.searchParams
    const isPublishedOnly = searchParams.get("published") === "true"
    const activeOnly = searchParams.get("active") === "true"

    // Базовые условия фильтрации
    const where: any = {}

    // Для обычных пользователей показываем только опубликованные объявления
    if (!session?.user || session.user.role !== "admin") {
      where.isPublished = true
    }
    // Для админов, если запрошены только опубликованные
    else if (isPublishedOnly) {
      where.isPublished = true
    }

    // Фильтр по активным объявлениям (в пределах даты начала и окончания)
    if (activeOnly) {
      const now = new Date()
      where.startDate = { lte: now }
      where.OR = [{ endDate: null }, { endDate: { gte: now } }]
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

// POST /api/announcements - создать новое объявление
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Проверка прав доступа
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Валидация данных
    if (!data.title || !data.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Преобразование дат из строк в объекты Date
    if (data.startDate) {
      data.startDate = new Date(data.startDate)
    }

    if (data.endDate) {
      data.endDate = new Date(data.endDate)
    }

    const announcement = await prisma.announcement.create({
      data,
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}
