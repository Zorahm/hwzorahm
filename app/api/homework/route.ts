import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"

// Обновляем GET метод, чтобы возвращать информацию о scheduleId
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const weekId = url.searchParams.get("weekId")
  const subject = url.searchParams.get("subject")
  const scheduleId = url.searchParams.get("scheduleId")

  try {
    const where: any = {}

    if (weekId) {
      where.weekId = Number(weekId)
    }

    if (subject) {
      where.subject = subject
    }

    if (scheduleId) {
      where.scheduleId = Number(scheduleId)
    }

    const homeworks = await prisma.homework.findMany({
      where,
      include: {
        files: true,
        schedule: true, // Включаем данные о расписании
      },
      orderBy: {
        deadline: "asc",
      },
    })

    return NextResponse.json(homeworks)
  } catch (error) {
    console.error("Error fetching homeworks:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

// Обновляем POST метод, чтобы правильно использовать связь с расписанием
export async function POST(request: NextRequest) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const body = await request.json()
    const {
      weekId,
      subject,
      description,
      shortDescription,
      detailedDescription,
      deadline,
      fileUrl,
      files,
      specificDate,
      forSpecificDateOnly,
      scheduleId, // Получаем scheduleId из запроса
    } = body

    // Валидация
    if (!weekId || !subject || !description || !deadline) {
      return NextResponse.json({ error: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    // Подготовка данных для создания
    const createData: any = {
      week: {
        connect: { id: Number(weekId) },
      },
      subject,
      description,
      shortDescription,
      detailedDescription,
      deadline: new Date(deadline),
      fileUrl,
      files: {
        create:
          files?.map((file: any) => ({
            filename: file.filename,
            fileUrl: file.fileUrl,
          })) || [],
      },
    }

    // Добавляем поля specificDate и forSpecificDateOnly только если они определены
    if (specificDate) {
      createData.specificDate = new Date(specificDate)
    }

    if (forSpecificDateOnly !== undefined) {
      createData.forSpecificDateOnly = forSpecificDateOnly
    }

    // Правильно добавляем связь с расписанием, если scheduleId предоставлен
    if (scheduleId) {
      createData.schedule = {
        connect: { id: Number(scheduleId) },
      }
    }

    // Создать домашнее задание
    const homework = await prisma.homework.create({
      data: createData,
      include: {
        files: true,
        schedule: true, // Включаем данные о расписании в ответ
      },
    })

    return NextResponse.json(homework)
  } catch (error) {
    console.error("Error creating homework:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
