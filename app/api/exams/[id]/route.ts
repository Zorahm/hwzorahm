import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      files: true,
    },
  })

  if (!exam) {
    return NextResponse.json({ error: "Экзамен не найден" }, { status: 404 })
  }

  return NextResponse.json(exam)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { weekId, subject, date, room, notes, theoryContent, practiceContent, files } = body

    // Валидация
    if (!subject || !date) {
      return NextResponse.json({ error: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    // Проверить, существует ли неделя, если указан weekId
    if (weekId) {
      const week = await prisma.week.findUnique({
        where: { id: weekId },
      })

      if (!week) {
        return NextResponse.json({ error: "Неделя не найдена" }, { status: 404 })
      }
    }

    // Если есть новые файлы, удаляем старые и добавляем новые
    if (files) {
      await prisma.file.deleteMany({
        where: { examId: id },
      })
    }

    // Обновить экзамен
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        weekId: weekId ? Number.parseInt(weekId) : null,
        subject,
        date: new Date(date),
        room,
        notes,
        theoryContent,
        practiceContent,
        files: files
          ? {
              create: files.map((file: any) => ({
                filename: file.filename,
                fileUrl: file.fileUrl,
              })),
            }
          : undefined,
      },
      include: {
        files: true,
      },
    })

    return NextResponse.json(updatedExam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
  }

  try {
    // Удалить экзамен (файлы удалятся автоматически благодаря onDelete: Cascade)
    await prisma.exam.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
