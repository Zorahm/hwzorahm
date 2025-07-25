import { type NextRequest, NextResponse } from "next/server"
import { isAdmin, forbidden } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface ScheduleItem {
  date: string
  dayOfWeek: string
  startTime: string
  endTime: string
  subject: string
  lessonType: string
  room: string
  teacher: string
}

interface Week {
  name: string
  startDate: Date
  endDate: Date
  items: ScheduleItem[]
}

export async function POST(request: NextRequest) {
  // Проверяем, является ли пользователь администратором
  if (!(await isAdmin(request))) {
    return forbidden()
  }

  try {
    const body = await request.json()
    const { weeks } = body

    if (!weeks || !Array.isArray(weeks) || weeks.length === 0) {
      return NextResponse.json({ error: "Данные для импорта не указаны или имеют неверный формат" }, { status: 400 })
    }

    // Получаем существующие недели для проверки на конфликты
    const existingWeeks = await prisma.week.findMany()

    let successCount = 0
    let skippedCount = 0
    let errorCount = 0
    let importedItemsCount = 0
    const results = []

    // Для каждой недели создаем записи
    for (const week of weeks as Week[]) {
      if (!week.name || !week.startDate || !week.endDate || !week.items || week.items.length === 0) {
        skippedCount++
        results.push({
          week: week.name,
          status: "skipped",
          reason: "Неполные данные недели",
        })
        continue
      }

      // Преобразуем строковые даты в объекты Date
      const startDate = new Date(week.startDate)
      const endDate = new Date(week.endDate)

      // Проверяем на конфликты с существующими неделями
      const hasConflict = checkWeekConflicts(startDate, endDate, existingWeeks)
      if (hasConflict.hasConflict) {
        skippedCount++
        results.push({
          week: week.name,
          status: "skipped",
          reason: `Конфликт с существующей неделей: ${hasConflict.message}`,
        })
        continue
      }

      try {
        // 1. Создаем новую неделю
        const newWeek = await prisma.week.create({
          data: {
            name: week.name,
            startDate,
            endDate,
            status: "active",
          },
        })

        // 2. Создаем записи расписания для этой недели
        let itemsImported = 0
        for (const item of week.items) {
          // Определяем день недели
          const day = item.dayOfWeek

          // Пропускаем записи без предмета или дня
          if (!item.subject || !day) continue

          // Определяем номер слота по времени начала
          let slot = 0
          if (item.startTime === "10:10") slot = 1
          else if (item.startTime === "11:50") slot = 2
          else if (item.startTime === "13:50") slot = 3
          else if (item.startTime === "15:30") slot = 4
          else if (item.startTime === "17:10") slot = 5

          // Преобразуем сокращенный день недели в полный
          const dayMap: Record<string, string> = {
            Пн: "Понедельник",
            Вт: "Вторник",
            Ср: "Среда",
            Чт: "Четверг",
            Пт: "Пятница",
            Сб: "Суббота",
            Вс: "Воскресенье",
            Понедельник: "Понедельник",
            Вторник: "Вторник",
            Среда: "Среда",
            Четверг: "Четверг",
            Пятница: "Пятница",
            Суббота: "Суббота",
            Воскресенье: "Воскресенье",
            "Не определен": "Понедельник", // Значение по умолчанию
          }

          const normalizedDay = dayMap[day] || "Понедельник"

          // Преобразуем тип занятия
          let lessonType = ""
          if (item.lessonType === "л") lessonType = "Лекция"
          else if (item.lessonType === "пр") lessonType = "Практика"
          else if (item.lessonType === "лп") lessonType = "Лабораторная"
          else if (item.lessonType === "к") lessonType = "Консультация"
          else lessonType = item.lessonType

          try {
            await prisma.schedule.create({
              data: {
                weekId: newWeek.id,
                day: normalizedDay,
                slot: slot || 0,
                subject: item.subject,
                teacher: item.teacher || null,
                room: item.room || null,
                customTime: true,
                startTime: item.startTime || null,
                endTime: item.endTime || null,
                isSkipped: false,
                lessonType: lessonType || null,
              },
            })
            itemsImported++
          } catch (error) {
            console.error("Error creating schedule item:", error)
          }
        }

        importedItemsCount += itemsImported
        successCount++
        results.push({
          week: week.name,
          status: "success",
          itemsImported,
          weekId: newWeek.id,
        })
      } catch (error) {
        console.error(`Error processing week ${week.name}:`, error)
        errorCount++
        results.push({
          week: week.name,
          status: "error",
          error: error instanceof Error ? error.message : "Неизвестная ошибка",
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalWeeks: weeks.length,
        successCount,
        skippedCount,
        errorCount,
        importedItemsCount,
      },
      results,
    })
  } catch (error) {
    console.error("Error importing schedule:", error)
    return NextResponse.json(
      {
        error: "Ошибка при импорте расписания",
        message: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}

// Проверка на пересечение дат с существующими неделями
function checkWeekConflicts(
  startDate: Date,
  endDate: Date,
  existingWeeks: any[],
): { hasConflict: boolean; message: string } {
  for (const week of existingWeeks) {
    const weekStart = new Date(week.startDate)
    const weekEnd = new Date(week.endDate)

    // Проверка на пересечение дат
    if (
      (startDate <= weekEnd && startDate >= weekStart) ||
      (endDate <= weekEnd && endDate >= weekStart) ||
      (startDate <= weekStart && endDate >= weekEnd)
    ) {
      return {
        hasConflict: true,
        message: `Пересечение с неделей "${week.name}" (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})`,
      }
    }
  }

  return { hasConflict: false, message: "" }
}
