import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"

// Получить все настройки сайта
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany()

    // Преобразуем массив в объект для удобства использования
    const settingsObject = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>,
    )

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

// Обновить настройку
export async function PATCH(request: NextRequest) {
  // Проверяем, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Необходимо указать ключ и значение" }, { status: 400 })
    }

    // Обновляем настройку или создаем, если не существует
    const updatedSetting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(updatedSetting)
  } catch (error) {
    console.error("Error updating setting:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
