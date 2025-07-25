import { type NextRequest, NextResponse } from "next/server"
import { isAdmin, forbidden } from "@/lib/auth"
import { scrapeSchedule } from "@/lib/scraper"

export async function POST(request: NextRequest) {
  // Проверяем, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "URL не указан" }, { status: 400 })
    }

    // Парсим расписание с сайта
    const items = await scrapeSchedule(url)

    if (items.length === 0) {
      return NextResponse.json({ error: "Не удалось найти расписание на странице", items: [] }, { status: 400 })
    }

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error("Error parsing schedule:", error)
    return NextResponse.json(
      {
        error: "Ошибка при парсинге расписания",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
