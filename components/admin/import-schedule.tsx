"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FileSpreadsheet, Upload, AlertTriangle, Check, X, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import * as XLSX from "xlsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface ParsedScheduleItem {
  day: string
  date: string
  time: string
  subject: string
  room: string
  type: string
  teacher: string
  slot?: number
  customTime?: boolean
  startTime?: string
  endTime?: string
  lessonType?: string
  weekIndex?: number
}

interface Week {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

interface WeekData {
  name: string
  startDate: string
  endDate: string
  items: ParsedScheduleItem[]
  hasConflict?: boolean
  conflictMessage?: string
}

// Определение стандартных слотов времени
interface TimeSlot {
  slot: number
  startTime: string
  endTime: string
}

export function ImportSchedule({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedScheduleItem[]>([])
  const [weekData, setWeekData] = useState<WeekData[]>([])
  const [existingWeeks, setExistingWeeks] = useState<Week[]>([])
  const [step, setStep] = useState<"upload" | "preview" | "confirm">("upload")
  const [activeTab, setActiveTab] = useState<string>("0")
  const [skipConflictingWeeks, setSkipConflictingWeeks] = useState(true)
  const [importOnlyNonConflicting, setImportOnlyNonConflicting] = useState(false)
  const { toast } = useToast()

  // Стандартные слоты времени
  const standardTimeSlots: TimeSlot[] = [
    { slot: 1, startTime: "10:10", endTime: "11:40" },
    { slot: 2, startTime: "11:50", endTime: "13:20" },
    { slot: 3, startTime: "13:50", endTime: "15:20" },
    { slot: 4, startTime: "15:30", endTime: "17:00" },
    { slot: 5, startTime: "17:10", endTime: "18:40" },
  ]

  // Проверка, является ли время стандартным
  const isStandardTime = (startTime: string, endTime: string): { isStandard: boolean; slot: number } => {
    // Нормализация времени (удаление секунд, если они есть)
    const normalizeTime = (time: string): string => {
      if (!time) return ""
      // Если время в формате HH:MM:SS, преобразуем в HH:MM
      if (time.split(":").length > 2) {
        return time.split(":").slice(0, 2).join(":")
      }
      return time
    }

    const normalizedStart = normalizeTime(startTime)
    const normalizedEnd = normalizeTime(endTime)

    // Проверка на соответствие стандартным слотам
    for (const slot of standardTimeSlots) {
      if (normalizedStart === slot.startTime && normalizedEnd === slot.endTime) {
        return { isStandard: true, slot: slot.slot }
      }
    }

    // Проверка на приблизительное соответствие (с погрешностью в несколько минут)
    for (const slot of standardTimeSlots) {
      // Преобразуем время в минуты для сравнения
      const startMinutes = timeToMinutes(normalizedStart)
      const endMinutes = timeToMinutes(normalizedEnd)
      const slotStartMinutes = timeToMinutes(slot.startTime)
      const slotEndMinutes = timeToMinutes(slot.endTime)

      // Допустимая погрешность в минутах
      const tolerance = 5

      if (
        Math.abs(startMinutes - slotStartMinutes) <= tolerance &&
        Math.abs(endMinutes - slotEndMinutes) <= tolerance
      ) {
        return { isStandard: true, slot: slot.slot }
      }
    }

    // Если не соответствует ни одному стандартному слоту
    return { isStandard: false, slot: 0 }
  }

  // Преобразование времени в минуты для сравнения
  const timeToMinutes = (time: string): number => {
    if (!time) return 0
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Определение слота по времени
  const getSlotByTime = (startTime: string): number => {
    if (!startTime) return 0

    // Проверка на точное соответствие
    for (const slot of standardTimeSlots) {
      if (startTime.includes(slot.startTime)) {
        return slot.slot
      }
    }

    // Если нет точного соответствия, определяем по приблизительному времени
    const timeMinutes = timeToMinutes(startTime)

    if (timeMinutes >= timeToMinutes("10:00") && timeMinutes < timeToMinutes("11:00")) return 1
    if (timeMinutes >= timeToMinutes("11:00") && timeMinutes < timeToMinutes("13:00")) return 2
    if (timeMinutes >= timeToMinutes("13:00") && timeMinutes < timeToMinutes("15:00")) return 3
    if (timeMinutes >= timeToMinutes("15:00") && timeMinutes < timeToMinutes("17:00")) return 4
    if (timeMinutes >= timeToMinutes("17:00") && timeMinutes < timeToMinutes("19:00")) return 5

    return 0
  }

  // Стандартные типы занятий, используемые в системе
  const standardLessonTypes = ["Лекция", "Практика", "Лабораторная", "Консультация", "Пересдача", "Экзамен", "Зачет"]

  // Загрузка существующих недель для проверки уникальности названия
  const fetchExistingWeeks = async () => {
    try {
      const response = await fetch("/api/weeks")
      if (!response.ok) {
        throw new Error("Ошибка при загрузке недель")
      }
      const data = await response.json()
      setExistingWeeks(data)
    } catch (error) {
      console.error("Error fetching weeks:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список недель",
        variant: "destructive",
      })
    }
  }

  // Обработчик выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Нормализация типа занятия из Excel в стандартный тип
  const normalizeLessonType = (excelType: string): string => {
    if (!excelType) return ""

    const typeMap: Record<string, string> = {
      // Лекции
      лек: "Лекция",
      лекция: "Лекция",
      л: "Лекция",
      "л-к": "Лекция",
      "лек.": "Лекция",
      лекц: "Лекция",
      "лекц.": "Лекция",

      // Практики
      пр: "Практика",
      практика: "Практика",
      практ: "Практика",
      "практ.": "Практика",
      практическое: "Практика",
      "практическое занятие": "Практика",
      пз: "Практика",
      п: "Практика",

      // Лабораторные
      лаб: "Лабораторная",
      "лаб.": "Лабораторная",
      лабораторная: "Лабораторная",
      "лабораторная работа": "Лабораторная",
      "лабораторный практикум": "Лабораторная",
      лр: "Лабораторная",

      // Консультации
      конс: "Консультация",
      "конс.": "Консультация",
      консультация: "Консультация",

      // Пересдачи
      пересдача: "Пересдача",
      перес: "Пересдача",
      "перес.": "Пересдача",

      // Экзамены
      экз: "Экзамен",
      "экз.": "Экзамен",
      экзамен: "Экзамен",

      // Зачеты
      зач: "Зачет",
      "зач.": "Зачет",
      зачет: "Зачет",
      зачёт: "Зачет",
    }

    const lowerType = excelType.toLowerCase().trim()

    // Прямое соответствие
    if (typeMap[lowerType]) {
      return typeMap[lowerType]
    }

    // Частичное соответствие
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.includes(key)) {
        return value
      }
    }

    // Если не найдено соответствие, возвращаем исходное значение
    // с первой буквой в верхнем регистре
    return excelType.charAt(0).toUpperCase() + excelType.slice(1)
  }

  // Преобразование сокращенного дня недели в полное название
  const expandDayOfWeek = (shortDay: string): string => {
    const dayMap: Record<string, string> = {
      пн: "Понедельник",
      вт: "Вторник",
      ср: "Среда",
      чт: "Четверг",
      пт: "Пятница",
      сб: "Суббота",
      вс: "Воскресенье",
    }

    return dayMap[shortDay.toLowerCase()] || shortDay
  }

  // Проверка, является ли день понедельником
  const isMonday = (day: string): boolean => {
    return day === "Понедельник" || day.toLowerCase() === "пн"
  }

  // Проверка на пересечение дат с существующими неделями
  const checkWeekConflicts = (startDate: string, endDate: string): { hasConflict: boolean; message: string } => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (const week of existingWeeks) {
      const weekStart = new Date(week.startDate)
      const weekEnd = new Date(week.endDate)

      // Проверка на пересечение дат
      if (
        (start <= weekEnd && start >= weekStart) ||
        (end <= weekEnd && end >= weekStart) ||
        (start <= weekStart && end >= weekEnd)
      ) {
        return {
          hasConflict: true,
          message: `Пересечение с неделей "${week.name}" (${new Date(week.startDate).toLocaleDateString()} - ${new Date(
            week.endDate,
          ).toLocaleDateString()})`,
        }
      }
    }

    return { hasConflict: false, message: "" }
  }

  // Парсинг XLSX файла
  const parseXLSX = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      // Загрузка существующих недель
      await fetchExistingWeeks()

      // Чтение файла
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Парсинг данных
      const parsedItems: ParsedScheduleItem[] = []
      let currentDay = ""
      let currentDate = ""
      let weekIndex = 0
      let isFirstDate = true // Флаг для первой даты в файле
      let lastProcessedDate = "" // Последняя обработанная дата

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]

        // Пропускаем пустые строки
        if (!row || row.length === 0) continue

        // Проверка на строку с датой
        if (row[0] && typeof row[0] === "string" && (row[0].includes(".") || row[0].includes(","))) {
          let dateStr = row[0].toString().trim()
          let dayOfWeek = ""

          // Обработка формата "13.05.25, вт"
          if (dateStr.includes(",")) {
            const parts = dateStr.split(",")
            dateStr = parts[0].trim()
            dayOfWeek = parts[1].trim()
          }

          // Если дата уже обрабатывалась, пропускаем
          if (dateStr === lastProcessedDate) continue

          lastProcessedDate = dateStr
          currentDate = dateStr

          // Если день недели указан в формате "вт", преобразуем его в полное название
          if (dayOfWeek && dayOfWeek.length <= 2) {
            currentDay = expandDayOfWeek(dayOfWeek)
          } else {
            currentDay = dayOfWeek || getDayFromDate(dateStr)
          }

          // Увеличиваем индекс недели, если:
          // 1. Это первая дата в файле
          // 2. Текущий день - понедельник
          if (isFirstDate || isMonday(currentDay)) {
            weekIndex++
            isFirstDate = false
          }

          continue
        }

        // Проверка на строку с расписанием
        if (row[0] && row[1]) {
          const timeStr = row[0].toString().trim()
          const subject = row[1].toString().trim()
          const room = row[2]?.toString().trim() || ""
          const rawLessonType = row[3]?.toString().trim() || ""
          const teacher = row[4]?.toString().trim() || ""

          // Нормализуем тип занятия
          const lessonType = normalizeLessonType(rawLessonType)

          // Парсинг времени
          let startTime = ""
          let endTime = ""
          let customTime = false
          let slot = 0

          if (timeStr.includes("-")) {
            const [start, end] = timeStr.split("-").map((t) => t.trim())
            startTime = start
            endTime = end

            // Проверяем, является ли время стандартным
            const timeCheck = isStandardTime(start, end)
            customTime = !timeCheck.isStandard
            slot = timeCheck.isStandard ? timeCheck.slot : getSlotByTime(start)
          } else {
            // Если только одно время (например, для пересдачи)
            startTime = timeStr
            customTime = true
            slot = getSlotByTime(startTime)
          }

          parsedItems.push({
            day: currentDay,
            date: currentDate,
            time: timeStr,
            subject,
            room,
            type: rawLessonType,
            teacher,
            slot,
            customTime,
            startTime,
            endTime,
            lessonType,
            weekIndex: weekIndex || 1, // Если не определен, считаем первой неделей
          })
        }
      }

      setParsedData(parsedItems)

      // Группировка по неделям
      const weeks: Record<number, ParsedScheduleItem[]> = {}
      parsedItems.forEach((item) => {
        if (!weeks[item.weekIndex || 0]) {
          weeks[item.weekIndex || 0] = []
        }
        weeks[item.weekIndex || 0].push(item)
      })

      // Создание данных для каждой недели
      const weeksData: WeekData[] = []

      Object.entries(weeks).forEach(([weekIdx, items]) => {
        // Находим первую и последнюю дату для этой недели
        const dates = items
          .map((item) => item.date)
          .filter(Boolean)
          .map((dateStr) => {
            // Обработка формата даты "13.05.25"
            const [day, month, year] = dateStr.split(".")
            return new Date(`20${year}-${month}-${day}`)
          })
          .sort((a, b) => a.getTime() - b.getTime())

        if (dates.length > 0) {
          const firstDate = dates[0]
          const lastDate = dates[dates.length - 1] || firstDate

          // Генерируем название недели
          const weekNumber = getWeekNumber(firstDate)
          let suggestedName = `Неделя ${weekNumber}`

          // Проверяем, что название уникально
          let counter = 1
          while (
            existingWeeks.some((w) => w.name === suggestedName) ||
            weeksData.some((w) => w.name === suggestedName)
          ) {
            suggestedName = `Неделя ${weekNumber} (${counter})`
            counter++
          }

          // Проверяем на конфликты с существующими неделями
          const startDateStr = formatDateForInput(firstDate)
          const endDateStr = formatDateForInput(lastDate)
          const conflict = checkWeekConflicts(startDateStr, endDateStr)

          weeksData.push({
            name: suggestedName,
            startDate: startDateStr,
            endDate: endDateStr,
            items: items,
            hasConflict: conflict.hasConflict,
            conflictMessage: conflict.message,
          })
        }
      })

      setWeekData(weeksData)
      setActiveTab("0")
      setStep("preview")

      // Проверяем, есть ли конфликты
      const conflictCount = weeksData.filter((w) => w.hasConflict).length
      if (conflictCount > 0) {
        toast({
          title: "Внимание",
          description: `Обнаружено ${conflictCount} недель с пересечением дат. Они будут отмечены в предпросмотре.`,
          variant: "warning",
        })
      } else {
        toast({
          title: "Файл обработан",
          description: `Найдено ${parsedItems.length} записей расписания в ${weeksData.length} неделях`,
        })
      }
    } catch (error) {
      console.error("Error parsing XLSX:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обработать файл. Проверьте формат файла.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Обновление данных недели
  const updateWeekData = (index: number, field: keyof WeekData, value: string) => {
    setWeekData((prev) => {
      const updated = [...prev]

      // Если обновляются даты, проверяем на конфликты
      if (field === "startDate" || field === "endDate") {
        const week = updated[index]
        const startDate = field === "startDate" ? value : week.startDate
        const endDate = field === "endDate" ? value : week.endDate

        // Проверяем на конфликты только если обе даты заданы
        if (startDate && endDate) {
          const conflict = checkWeekConflicts(startDate, endDate)
          updated[index] = {
            ...week,
            [field]: value,
            hasConflict: conflict.hasConflict,
            conflictMessage: conflict.message,
          }
        } else {
          updated[index] = {
            ...week,
            [field]: value,
          }
        }
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        }
      }

      return updated
    })
  }

  // Сохранение расписания
  const saveSchedule = async () => {
    if (weekData.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нет данных для импорта",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let successCount = 0
      let skippedCount = 0
      let errorCount = 0
      let importedItemsCount = 0

      // Для каждой недели создаем записи
      for (const week of weekData) {
        if (!week.name || !week.startDate || !week.endDate || week.items.length === 0) {
          skippedCount++
          continue
        }

        // Пропускаем недели с конфликтами, если включена соответствующая опция
        if (skipConflictingWeeks && week.hasConflict) {
          skippedCount++
          continue
        }

        try {
          // 1. Создаем новую неделю
          const weekResponse = await fetch("/api/weeks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: week.name,
              startDate: week.startDate,
              endDate: week.endDate,
            }),
          })

          if (!weekResponse.ok) {
            const error = await weekResponse.json()

            // Если ошибка связана с пересечением дат и мы хотим импортировать только неконфликтующие записи
            if (error.error?.includes("пересекаются") && importOnlyNonConflicting) {
              // Находим существующую неделю, с которой конфликт
              const existingWeek = await findExistingWeekByDates(week.startDate, week.endDate)

              if (existingWeek) {
                // Импортируем только те записи, которые не конфликтуют с существующей неделей
                const nonConflictingItems = await importNonConflictingItems(week.items, existingWeek.id)
                importedItemsCount += nonConflictingItems

                if (nonConflictingItems > 0) {
                  successCount++
                } else {
                  skippedCount++
                }

                continue
              }
            }

            // Если другая ошибка или не удалось найти существующую неделю
            console.error(`Error creating week ${week.name}:`, error)
            errorCount++
            continue
          }

          const weekData = await weekResponse.json()
          const weekId = weekData.id

          // 2. Создаем записи расписания для этой недели
          let itemsImported = 0
          for (const item of week.items) {
            // Определяем день недели на русском
            let day = item.day

            // Если день недели в сокращенном формате, преобразуем его
            if (day && day.length <= 2) {
              day = expandDayOfWeek(day)
            } else if (!day) {
              day = getDayFromDate(item.date)
            }

            // Пропускаем записи без предмета или дня
            if (!item.subject || !day) continue

            try {
              const response = await fetch("/api/schedule", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  weekId,
                  day,
                  slot: item.slot || 0,
                  subject: item.subject,
                  teacher: item.teacher || null,
                  room: item.room || null,
                  customTime: item.customTime || false,
                  startTime: item.customTime ? item.startTime : null,
                  endTime: item.customTime ? item.endTime : null,
                  isSkipped: false,
                  lessonType: item.lessonType || null,
                }),
              })

              if (response.ok) {
                itemsImported++
              }
            } catch (error) {
              console.error("Error creating schedule item:", error)
            }
          }

          importedItemsCount += itemsImported
          successCount++
        } catch (error) {
          console.error(`Error processing week ${week.name}:`, error)
          errorCount++
        }
      }

      // Формируем сообщение о результатах импорта
      let message = `Импортировано ${successCount} недель с ${importedItemsCount} записями расписания.`
      if (skippedCount > 0) {
        message += ` Пропущено ${skippedCount} недель.`
      }
      if (errorCount > 0) {
        message += ` Ошибки при импорте ${errorCount} недель.`
      }

      toast({
        title: "Импорт завершен",
        description: message,
        variant: successCount > 0 ? "default" : "warning",
      })

      // Сбрасываем состояние
      setFile(null)
      setParsedData([])
      setWeekData([])
      setStep("upload")

      // Вызываем колбэк успеха
      onSuccess()
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить расписание",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Поиск существующей недели по датам
  const findExistingWeekByDates = async (startDate: string, endDate: string): Promise<Week | null> => {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)

      for (const week of existingWeeks) {
        const weekStart = new Date(week.startDate)
        const weekEnd = new Date(week.endDate)

        // Проверка на пересечение дат
        if (
          (start <= weekEnd && start >= weekStart) ||
          (end <= weekEnd && end >= weekStart) ||
          (start <= weekStart && end >= weekEnd)
        ) {
          return week
        }
      }
    } catch (error) {
      console.error("Error finding existing week:", error)
    }

    return null
  }

  // Импорт неконфликтующих записей в существующую неделю
  const importNonConflictingItems = async (items: ParsedScheduleItem[], weekId: number): Promise<number> => {
    let importedCount = 0

    // Получаем существующие записи расписания для этой недели
    const existingScheduleResponse = await fetch(`/api/schedule?weekId=${weekId}`)
    if (!existingScheduleResponse.ok) {
      return 0
    }

    const existingSchedule = await existingScheduleResponse.json()

    // Для каждой записи проверяем, не конфликтует ли она с существующими
    for (const item of items) {
      // Определяем день недели на русском
      let day = item.day

      // Если день недели в сокращенном формате, преобразуем его
      if (day && day.length <= 2) {
        day = expandDayOfWeek(day)
      } else if (!day) {
        day = getDayFromDate(item.date)
      }

      // Пропускаем записи без предмета или дня
      if (!item.subject || !day) continue

      // Проверяем, есть ли уже запись для этого дня и слота
      const conflict = existingSchedule.some((s: any) => s.day === day && s.slot === (item.slot || 0))

      // Если нет конфликта, импортируем запись
      if (!conflict) {
        try {
          const response = await fetch("/api/schedule", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              weekId,
              day,
              slot: item.slot || 0,
              subject: item.subject,
              teacher: item.teacher || null,
              room: item.room || null,
              customTime: item.customTime || false,
              startTime: item.customTime ? item.startTime : null,
              endTime: item.customTime ? item.endTime : null,
              isSkipped: false,
              lessonType: item.lessonType || null,
            }),
          })

          if (response.ok) {
            importedCount++
          }
        } catch (error) {
          console.error("Error creating schedule item:", error)
        }
      }
    }

    return importedCount
  }

  // Вспомогательные функции
  const getDayFromDate = (dateStr: string): string => {
    if (!dateStr) return ""

    try {
      // Обработка формата даты "13.05.25"
      const [day, month, year] = dateStr.split(".")
      const date = new Date(`20${year}-${month}-${day}`)
      const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
      return days[date.getDay()]
    } catch (e) {
      console.error("Error parsing date:", e, dateStr)
      return ""
    }
  }

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const getLessonTypeBadge = (type: string | undefined) => {
    if (!type) return null

    const typeColorMap: Record<string, string> = {
      Лекция: "bg-blue-500/70",
      Практика: "bg-green-500/70",
      Лабораторная: "bg-purple-500/70",
      Консультация: "bg-yellow-500/70",
      Пересдача: "bg-red-500/70",
      Экзамен: "bg-orange-500/70",
      Зачет: "bg-orange-500/70",
    }

    const bgColor = typeColorMap[type] || "bg-gray-500/70"

    return (
      <Badge variant="secondary" className={`${bgColor} text-white text-xs`}>
        {type}
      </Badge>
    )
  }

  return (
    <Card className="border-border/30 bg-card shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
              </div>
              Импорт расписания из Excel
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Загрузите файл Excel с расписанием для создания новых недель
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-primary/20 bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Импорт расписания</AlertTitle>
          <AlertDescription>
            Загрузите файл Excel с расписанием для автоматического создания недель и занятий. Проверяйте результаты
            импорта перед сохранением.
          </AlertDescription>
        </Alert>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xlsx-file">Выберите файл Excel (.xlsx)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="xlsx-file"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="border-border/30 bg-background/30 backdrop-blur-sm"
                />
                <Button onClick={parseXLSX} disabled={!file || isLoading} className="bg-primary hover:bg-primary/90">
                  <Upload className="mr-2 h-4 w-4" />
                  Загрузить
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Поддерживаемый формат: Excel (.xlsx) с колонками "Время", "Курс", "Место проведения", "Вид занятия",
                "Преподаватель"
              </p>
              <Alert className="mt-4 border-primary/20 bg-primary/10">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>Обнаружение недель</AlertTitle>
                <AlertDescription>
                  Система определяет недели следующим образом:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Первая дата в файле всегда начинает новую неделю</li>
                    <li>Каждый новый понедельник начинает новую неделю</li>
                    <li>Пропущенные дни недели не влияют на определение недель</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {step === "preview" && weekData.length > 0 && (
          <div className="space-y-4">
            <Alert className="border-primary/20 bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Обнаружено несколько недель</AlertTitle>
              <AlertDescription>
                Система обнаружила {weekData.length} недель в загруженном файле. Проверьте данные каждой недели перед
                импортом.
              </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList
                className="mb-4 grid w-full bg-background/30 backdrop-blur-sm"
                style={{ gridTemplateColumns: `repeat(${Math.min(weekData.length, 6)}, 1fr)` }}
              >
                {weekData.map((week, index) => (
                  <TabsTrigger key={index} value={index.toString()} className="data-[state=active]:bg-primary/20">
                    <div className="flex items-center gap-1">
                      Неделя {index + 1}
                      {week.hasConflict && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {weekData.map((week, index) => (
                <TabsContent key={index} value={index.toString()} className="space-y-4">
                  {week.hasConflict && (
                    <Alert className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Конфликт дат</AlertTitle>
                      <AlertDescription>{week.conflictMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`week-name-${index}`}>Название недели</Label>
                      <Input
                        id={`week-name-${index}`}
                        value={week.name}
                        onChange={(e) => updateWeekData(index, "name", e.target.value)}
                        placeholder="Например: Неделя 3"
                        className="border-border/30 bg-background/30 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`start-date-${index}`}>Дата начала</Label>
                      <Input
                        id={`start-date-${index}`}
                        type="date"
                        value={week.startDate}
                        onChange={(e) => updateWeekData(index, "startDate", e.target.value)}
                        className="border-border/30 bg-background/30 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-date-${index}`}>Дата окончания</Label>
                      <Input
                        id={`end-date-${index}`}
                        type="date"
                        value={week.endDate}
                        onChange={(e) => updateWeekData(index, "endDate", e.target.value)}
                        className="border-border/30 bg-background/30 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Предпросмотр данных ({week.items.length} записей)</Label>
                    <div className="max-h-60 overflow-y-auto rounded-md border border-border/30 bg-background/30 backdrop-blur-sm p-2">
                      <table className="min-w-full">
                        <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                          <tr>
                            <th className="p-2 text-left text-xs">День</th>
                            <th className="p-2 text-left text-xs">Дата</th>
                            <th className="p-2 text-left text-xs">Время</th>
                            <th className="p-2 text-left text-xs">Слот</th>
                            <th className="p-2 text-left text-xs">Кастомное</th>
                            <th className="p-2 text-left text-xs">Предмет</th>
                            <th className="p-2 text-left text-xs">Тип</th>
                            <th className="p-2 text-left text-xs">Аудитория</th>
                            <th className="p-2 text-left text-xs">Преподаватель</th>
                          </tr>
                        </thead>
                        <tbody>
                          {week.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-border/20">
                              <td className="p-2 text-xs">
                                {item.day && item.day.length <= 2
                                  ? expandDayOfWeek(item.day)
                                  : item.day || getDayFromDate(item.date)}
                              </td>
                              <td className="p-2 text-xs">{item.date}</td>
                              <td className="p-2 text-xs">{item.time}</td>
                              <td className="p-2 text-xs">{item.slot || 0}</td>
                              <td className="p-2 text-xs">{item.customTime ? "Да" : "Нет"}</td>
                              <td className="p-2 text-xs">{item.subject}</td>
                              <td className="p-2 text-xs">{getLessonTypeBadge(item.lessonType)}</td>
                              <td className="p-2 text-xs">{item.room}</td>
                              <td className="p-2 text-xs">{item.teacher}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("upload")} className="border-border/30">
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
              <Button onClick={() => setStep("confirm")} className="bg-primary hover:bg-primary/90">
                <Check className="mr-2 h-4 w-4" />
                Продолжить
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <Alert className="border-primary/20 bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
              <AlertTitle>Подтверждение импорта</AlertTitle>
              <AlertDescription>
                Будет создано {weekData.length} недель с расписанием. Это действие нельзя отменить.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Сводка импорта:</h3>
              <div className="max-h-60 overflow-y-auto rounded-md border border-border/30 bg-background/30 backdrop-blur-sm p-4">
                {weekData.map((week, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-border/20 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{week.name}</h4>
                      {week.hasConflict && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Конфликт
                        </Badge>
                      )}
                    </div>
                    {week.hasConflict && <p className="text-xs text-yellow-500 mt-1 mb-2">{week.conflictMessage}</p>}
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Период: {new Date(week.startDate).toLocaleDateString()} -{" "}
                        {new Date(week.endDate).toLocaleDateString()}
                      </li>
                      <li>• Количество записей: {week.items.length}</li>
                      <li>
                        • Дни недели:{" "}
                        {[
                          ...new Set(
                            week.items.map((item) => {
                              if (item.day && item.day.length <= 2) {
                                return expandDayOfWeek(item.day)
                              }
                              return item.day || getDayFromDate(item.date)
                            }),
                          ),
                        ].join(", ")}
                      </li>
                      <li>• Предметы: {[...new Set(week.items.map((item) => item.subject))].join(", ")}</li>
                      <li>
                        • Типы занятий:{" "}
                        {[...new Set(week.items.map((item) => item.lessonType).filter(Boolean))].join(", ")}
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border border-border/30 rounded-md p-4 bg-background/30 backdrop-blur-sm">
              <h3 className="text-sm font-medium mb-2">Настройки импорта:</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-conflicting"
                  checked={skipConflictingWeeks}
                  onCheckedChange={(checked) => setSkipConflictingWeeks(checked as boolean)}
                />
                <Label htmlFor="skip-conflicting" className="text-sm">
                  Пропускать недели с конфликтами дат
                </Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="import-non-conflicting"
                  checked={importOnlyNonConflicting}
                  onCheckedChange={(checked) => setImportOnlyNonConflicting(checked as boolean)}
                />
                <Label htmlFor="import-non-conflicting" className="text-sm">
                  Импортировать неконфликтующие записи в существующие недели
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Если включена опция "Импортировать неконфликтующие записи", система попытается добавить записи
                расписания в существующие недели, если они не конфликтуют с уже имеющимися записями.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("preview")} className="border-border/30">
                Назад
              </Button>
              <Button onClick={saveSchedule} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? "Сохранение..." : "Импортировать"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
