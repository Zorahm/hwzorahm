import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// GET /api/notes - получение всех конспектов
export async function GET(request: NextRequest) {
  try {
    const notes = await prisma.note.findMany({
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
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

// POST /api/notes - создание нового конспекта
export async function POST(request: NextRequest) {
  // Проверка аутентификации и прав администратора
  const user = await getUser(request)

  // Если пользователь не авторизован, возвращаем 401
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { subject, title, content, scheduleId, weekId, images } = data

    // Создание конспекта с привязкой к неделе
    const note = await prisma.note.create({
      data: {
        subject,
        title,
        content,
        scheduleId: scheduleId || null,
        weekId: weekId || null, // Добавляем привязку к неделе
      },
    })

    // Добавление изображений
    if (images && images.length > 0) {
      await Promise.all(
        images.map((image: { filename: string; imageUrl: string }) =>
          prisma.noteImage.create({
            data: {
              filename: image.filename,
              imageUrl: image.imageUrl,
              noteId: note.id,
            },
          }),
        ),
      )
    }

    // Получение созданного конспекта со всеми связанными данными
    const createdNote = await prisma.note.findUnique({
      where: { id: note.id },
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

    return NextResponse.json(createdNote, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
