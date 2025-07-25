import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Используем await для обработки params, хотя в данном случае это не обязательно
  const { id } = await Promise.resolve(params)
  const numericId = Number.parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: numericId },
  })

  if (!schedule) {
    return NextResponse.json({ error: "Запись расписания не найдена" }, { status: 404 })
  }

  return NextResponse.json(schedule)
}

// В функции PATCH обновим обновление записи расписания
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  // Используем await для обработки params
  const { id } = await Promise.resolve(params)
  const numericId = Number.parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { subject, teacher, room, customTime, startTime, endTime, isSkipped, lessonType } = body

    console.log("Updating schedule ID:", numericId, "with data:", {
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
    if (subject === undefined || subject === null || subject === "") {
      return NextResponse.json({ error: "Предмет обязателен" }, { status: 400 })
    }

    // Обновить запись расписания
    const updatedSchedule = await prisma.schedule.update({
      where: { id: numericId },
      data: {
        subject,
        teacher,
        room,
        customTime: customTime || false,
        startTime: customTime ? startTime : null,
        endTime: customTime ? endTime : null,
        isSkipped: isSkipped || false,
        lessonType: lessonType || null,
      },
    })

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  // Используем await для обработки params
  const { id } = await Promise.resolve(params)
  const numericId = Number.parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
  }

  try {
    // Удалить запись расписания
    await prisma.schedule.delete({ where: { id: numericId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
