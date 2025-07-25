import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const weekId = searchParams.get("weekId")
  const subject = searchParams.get("subject")

  const filter: any = {}

  if (weekId) {
    filter.weekId = Number.parseInt(weekId)
  }

  if (subject) {
    filter.subject = subject
  }

  const exams = await prisma.exam.findMany({
    where: filter,
    orderBy: { date: "asc" },
    include: {
      files: true,
    },
  })

  return NextResponse.json(exams)
}

// Функция для определения недели по дате
async function findWeekByDate(date: Date) {
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: "asc" },
  })

  for (const week of weeks) {
    const startDate = new Date(week.startDate)
    const endDate = new Date(week.endDate)

    // Проверяем, попадает ли дата экзамена в диапазон недели
    if (date >= startDate && date <= endDate) {
      return week.id
    }
  }

  return null // Если неделя не найдена
}

export async function POST(request: NextRequest) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const body = await request.json()
    const { weekId, subject, date, room, notes, theoryContent, practiceContent, files } = body

    // Валидация
    if (!subject || !date) {
      return NextResponse.json({ error: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    const examDate = new Date(date)

    // Определяем weekId автоматически по дате экзамена, если он не передан
    let finalWeekId = weekId
    if (!finalWeekId) {
      finalWeekId = await findWeekByDate(examDate)
    }

    // Если weekId передан, проверить, существует ли неделя
    if (finalWeekId) {
      const week = await prisma.week.findUnique({
        where: { id: finalWeekId },
      })

      if (!week) {
        // Если переданная неделя не существует, попробуем найти по дате
        finalWeekId = await findWeekByDate(examDate)
      }
    }

    // Создать новый экзамен
    const newExam = await prisma.exam.create({
      data: {
        weekId: finalWeekId,
        subject,
        date: examDate,
        room,
        notes,
        theoryContent,
        practiceContent,
        files: {
          create: files
            ? files.map((file: any) => ({
                filename: file.filename,
                fileUrl: file.fileUrl,
              }))
            : [],
        },
      },
      include: {
        files: true,
      },
    })

    return NextResponse.json(newExam)
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}