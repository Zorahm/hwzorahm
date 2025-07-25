import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"
import { getCurrentWeek } from "@/lib/weeks"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const weekId = searchParams.get("weekId")
  const day = searchParams.get("day")

  const filter: any = {}

  if (weekId) {
    filter.weekId = Number.parseInt(weekId)
  } else {
    // Если weekId не указан, используем текущую неделю
    const currentWeek = await getCurrentWeek()
    if (currentWeek) {
      filter.weekId = currentWeek.id
    }
  }

  if (day) {
    filter.day = day
  }

  const schedule = await prisma.schedule.findMany({
    where: filter,
    orderBy: [{ day: "asc" }, { slot: "asc" }],
  })

  return NextResponse.json(schedule)
}

export async function POST(request: NextRequest) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const body = await request.json()
    const { weekId, day, slot, subject, teacher, room, customTime, startTime, endTime, isSkipped, lessonType } = body

    // Log the incoming data for debugging
    console.log("Creating schedule with data:", {
      weekId,
      day,
      slot,
      subject,
      teacher,
      room,
      customTime,
      startTime,
      endTime,
      isSkipped,
      lessonType,
    })

    // Валидация
    if (!weekId || !day || slot === undefined || slot === null || !subject) {
      return NextResponse.json({ error: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    // Проверить, существует ли неделя
    const week = await prisma.week.findUnique({
      where: { id: weekId },
    })

    if (!week) {
      return NextResponse.json({ error: "Неделя не найдена" }, { status: 404 })
    }

    // Проверить, существует ли уже запись для этого дня и слота
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        weekId,
        day,
        slot,
      },
    })

    if (existingSchedule) {
      return NextResponse.json({ error: "Запись для этого дня и слота уже существует" }, { status: 400 })
    }

    // Создать новую запись расписания
    const newSchedule = await prisma.schedule.create({
      data: {
        weekId,
        day,
        slot,
        subject,
        teacher: teacher || null,
        room: room || null,
        customTime: customTime || false,
        startTime: customTime ? startTime : null,
        endTime: customTime ? endTime : null,
        isSkipped: isSkipped || false,
        lessonType: lessonType || null,
      },
    })

    return NextResponse.json(newSchedule)
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
