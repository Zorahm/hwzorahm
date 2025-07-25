import { prisma } from "./prisma"

// Обновим функцию updateWeekStatuses для более надежного обновления статусов
export async function updateWeekStatuses() {
  const today = new Date()

  // Найти все недели
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: "asc" },
  })

  // Обновить статусы недель
  for (const week of weeks) {
    let status = "future"
    const startDate = new Date(week.startDate)
    const endDate = new Date(week.endDate)

    // Установка времени на начало и конец дня для корректного сравнения
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    if (today >= startDate && today <= endDate) {
      status = "current"
    } else if (today > endDate) {
      status = "past"
    }

    // Обновить статус, если он изменился
    if (week.status !== status) {
      await prisma.week.update({
        where: { id: week.id },
        data: { status },
      })
    }
  }
}

// Обновим функцию getCurrentWeek, чтобы она всегда возвращала текущую неделю
export async function getCurrentWeek() {
  // Обновить статусы недель
  await updateWeekStatuses()

  // Найти текущую неделю
  const currentWeek = await prisma.week.findFirst({
    where: { status: "current" },
  })

  // Если текущая неделя не найдена, вернуть ближайшую будущую неделю
  if (!currentWeek) {
    return prisma.week.findFirst({
      where: { status: "future" },
      orderBy: { startDate: "asc" },
    })
  }

  return currentWeek
}
