import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, forbidden } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
    }

    const homework = await prisma.homework.findUnique({
      where: { id },
      include: {
        files: true,
        schedule: true, // Включаем данные о расписании
      },
    })

    if (!homework) {
      return NextResponse.json({ error: "Домашнее задание не найдено" }, { status: 404 })
    }

    return NextResponse.json(homework)
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
    }

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

    // Получить текущие файлы
    const currentHomework = await prisma.homework.findUnique({
      where: { id },
      include: { files: true },
    })

    if (!currentHomework) {
      return NextResponse.json({ error: "Домашнее задание не найдено" }, { status: 404 })
    }

    // Подготовка данных для обновления
    const updateData: any = {
      weekId: Number(weekId),
      subject,
      description,
      shortDescription,
      detailedDescription,
      deadline: new Date(deadline),
      fileUrl,
    }

    // Добавляем поля specificDate и forSpecificDateOnly только если они определены
    if (specificDate) {
      updateData.specificDate = new Date(specificDate)
    }

    if (forSpecificDateOnly !== undefined) {
      updateData.forSpecificDateOnly = forSpecificDateOnly
    }

    // Правильно обновляем связь с расписанием
    if (scheduleId) {
      updateData.schedule = {
        connect: { id: Number(scheduleId) },
      }
    } else {
      // Если scheduleId не предоставлен, отключаем связь с расписанием
      updateData.schedule = {
        disconnect: true,
      }
    }

    // Обновить домашнее задание
    const homework = await prisma.homework.update({
      where: { id },
      data: {
        ...updateData,
        // Обновить файлы
        files: {
          // Удалить все текущие файлы
          deleteMany: {},
          // Создать новые файлы
          create:
            files?.map((file: any) => ({
              filename: file.filename,
              fileUrl: file.fileUrl,
            })) || [],
        },
      },
      include: {
        files: true,
        schedule: true, // Включаем данные о расписании в ответ
      },
    })

    return NextResponse.json(homework)
  } catch (error) {
    console.error("Error updating homework:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Проверить, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 })
    }

    // Удалить домашнее задание
    await prisma.homework.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting homework:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
