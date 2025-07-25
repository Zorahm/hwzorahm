import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser, isAdmin } from "@/lib/auth"

// GET /api/notes/[id] - получение конспекта по ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        images: true,
        schedule: {
          select: {
            id: true,
            subject: true,
            day: true,
            slot: true,
          },
        },
        week: true, // Добавляем связь с неделей
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 })
  }
}

// PUT /api/notes/[id] - обновление конспекта
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const user = await getUser(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { subject, title, content, scheduleId, weekId, images } = data

    // Обновление конспекта
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        subject,
        title,
        content,
        scheduleId: scheduleId || null,
        weekId: weekId || null, // Добавляем привязку к неделе
      },
    })

    // Удаление всех существующих изображений
    await prisma.noteImage.deleteMany({
      where: { noteId: id },
    })

    // Добавление новых изображений
    if (images && images.length > 0) {
      await Promise.all(
        images.map((image: { filename: string; imageUrl: string }) =>
          prisma.noteImage.create({
            data: {
              filename: image.filename,
              imageUrl: image.imageUrl,
              noteId: id,
            },
          }),
        ),
      )
    }

    // Получение обновленного конспекта со всеми связанными данными
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        images: true,
        schedule: {
          select: {
            id: true,
            subject: true,
            day: true,
            slot: true,
          },
        },
        week: true, // Включаем данные о неделе
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - удаление конспекта
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  // Проверка прав администратора
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Удаление всех связанных изображений
    await prisma.noteImage.deleteMany({
      where: { noteId: id },
    })

    // Удаление конспекта
    await prisma.note.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
