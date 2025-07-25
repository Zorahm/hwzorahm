"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { GraduationCap, Upload, Check, X, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import * as XLSX from "xlsx"
import { Checkbox } from "@/components/ui/checkbox"

interface ParsedExamItem {
  date: string
  time: string
  subject: string
  room: string
  examType: string
  teacher: string
  fullDateTime: Date
}

interface ExamData {
  items: ParsedExamItem[]
}

export function ImportExams({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedExamItem[]>([])
  const [step, setStep] = useState<"upload" | "preview" | "confirm">("upload")
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const { toast } = useToast()

  // Обработчик выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Проверка, является ли запись экзаменом или зачетом
  const isExamOrCredit = (lessonType: string): boolean => {
    if (!lessonType) return false

    const lowerType = lessonType.toLowerCase().trim()

    // Ищем ключевые слова для экзаменов и зачетов
    const examKeywords = [
      "экз",
      "экзамен",
      "зач",
      "зачет",
      "зачёт",
      "им(экз)",
      "им (экз)",
      "им(зач)",
      "им (зач)",
      "им(зачет)",
      "им (зачет)",
      "им(зачёт)",
      "им (зачёт)",
      "зачет с оценкой",
      "зачёт с оценкой",
    ]

    return examKeywords.some((keyword) => lowerType.includes(keyword))
  }

  // Определение типа экзамена
  const getExamType = (lessonType: string): string => {
    if (!lessonType) return "Экзамен"

    const lowerType = lessonType.toLowerCase().trim()

    if (lowerType.includes("экз") || lowerType.includes("экзамен")) {
      return "Экзамен"
    } else if (lowerType.includes("зач") || lowerType.includes("зачет") || lowerType.includes("зачёт")) {
      return "Зачет"
    }

    return "Экзамен"
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

  // Парсинг XLSX файла
  const parseXLSX = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      // Чтение файла
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Парсинг данных
      const parsedItems: ParsedExamItem[] = []
      let currentDate = ""
      let currentDayOfWeek = ""

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]

        // Пропускаем пустые строки
        if (!row || row.length === 0) continue

        // Проверка на строку с датой
        if (row[0] && typeof row[0] === "string" && (row[0].includes(".") || row[0].includes(","))) {
          let dateStr = row[0].toString().trim()
          let dayOfWeek = ""

          // Обработка формата "03.06.25, вт"
          if (dateStr.includes(",")) {
            const parts = dateStr.split(",")
            dateStr = parts[0].trim()
            dayOfWeek = parts[1].trim()
          }

          currentDate = dateStr

          // Если день недели указан в формате "вт", преобразуем его в полное название
          if (dayOfWeek && dayOfWeek.length <= 2) {
            currentDayOfWeek = expandDayOfWeek(dayOfWeek)
          } else {
            currentDayOfWeek = dayOfWeek || getDayFromDate(dateStr)
          }

          continue
        }

        // Проверка на строку с расписанием
        if (row[0] && row[1] && currentDate) {
          const timeStr = row[0].toString().trim()
          const subject = row[1].toString().trim()
          const room = row[2]?.toString().trim() || ""
          const lessonType = row[3]?.toString().trim() || ""
          const teacher = row[4]?.toString().trim() || ""

          // Проверяем, является ли это экзаменом или зачетом
          if (!isExamOrCredit(lessonType)) {
            continue
          }

          // Парсинг времени
          let time = ""
          let fullDateTime: Date

          if (timeStr.includes("-")) {
            // Если указан диапазон времени, берем начальное время
            const [startTime] = timeStr.split("-").map((t) => t.trim())
            time = startTime
          } else {
            // Если только одно время
            time = timeStr
          }

          // Создаем полную дату и время
          try {
            const [day, month, year] = currentDate.split(".")
            const [hours, minutes] = time.split(":").map(Number)
            fullDateTime = new Date(
              `20${year}-${month}-${day}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`,
            )
          } catch (error) {
            console.error("Error parsing date/time:", error)
            continue
          }

          // Определяем тип экзамена
          const examType = getExamType(lessonType)

          parsedItems.push({
            date: currentDate,
            time,
            subject,
            room,
            examType,
            teacher,
            fullDateTime,
          })
        }
      }

      setParsedData(parsedItems)
      setStep("preview")

      toast({
        title: "Файл обработан",
        description: `Найдено ${parsedItems.length} экзаменов и зачетов`,
      })
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

  // Сохранение экзаменов
  const saveExams = async () => {
    if (parsedData.length === 0) {
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

      // Получаем существующие экзамены для проверки дубликатов
      const existingExamsResponse = await fetch("/api/exams")
      const existingExams = existingExamsResponse.ok ? await existingExamsResponse.json() : []

      for (const item of parsedData) {
        try {
          // Проверяем на дубликаты, если включена соответствующая опция
          if (skipDuplicates) {
            const duplicate = existingExams.find(
              (exam: any) =>
                exam.subject === item.subject &&
                new Date(exam.date).toDateString() === item.fullDateTime.toDateString(),
            )

            if (duplicate) {
              skippedCount++
              continue
            }
          }

          // Создаем экзамен
          const response = await fetch("/api/exams", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // weekId не передаем, API автоматически определит по дате
              subject: item.subject,
              date: item.fullDateTime.toISOString(),
              room: item.room || null,
              notes: `Тип: ${item.examType}${item.teacher ? `, Преподаватель: ${item.teacher}` : ""}`,
              theoryContent: null,
              practiceContent: null,
              files: [],
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            console.error(`Error creating exam for ${item.subject}:`, await response.text())
            errorCount++
          }
        } catch (error) {
          console.error(`Error processing exam ${item.subject}:`, error)
          errorCount++
        }
      }

      // Формируем сообщение о результатах импорта
      let message = `Импортировано ${successCount} экзаменов.`
      if (skippedCount > 0) {
        message += ` Пропущено ${skippedCount} дубликатов.`
      }
      if (errorCount > 0) {
        message += ` Ошибки при импорте ${errorCount} записей.`
      }

      toast({
        title: "Импорт завершен",
        description: message,
        variant: successCount > 0 ? "default" : "warning",
      })

      // Сбрасываем состояние
      setFile(null)
      setParsedData([])
      setStep("upload")

      // Вызываем колбэк успеха
      onSuccess()
    } catch (error) {
      console.error("Error saving exams:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить экзамены",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Вспомогательные функции
  const getDayFromDate = (dateStr: string): string => {
    if (!dateStr) return ""

    try {
      // Обработка формата даты "03.06.25"
      const [day, month, year] = dateStr.split(".")
      const date = new Date(`20${year}-${month}-${day}`)
      const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
      return days[date.getDay()]
    } catch (e) {
      console.error("Error parsing date:", e, dateStr)
      return ""
    }
  }

  const getExamTypeBadge = (type: string) => {
    const typeColorMap: Record<string, string> = {
      Экзамен: "bg-red-500/70",
      Зачет: "bg-green-500/70",
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
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              Импорт экзаменов из Excel
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Загрузите файл Excel с экзаменами и зачетами для автоматического создания записей
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-primary/20 bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Импорт экзаменов</AlertTitle>
          <AlertDescription>
            Система автоматически определит экзамены и зачеты по ключевым словам в колонке "Вид занятия".
            Поддерживаются: ИМ(экз), ИМ(зач), зачет с оценкой, экзамен.
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
            </div>
          </div>
        )}

        {step === "preview" && parsedData.length > 0 && (
          <div className="space-y-4">
            <Alert className="border-primary/20 bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Найдены экзамены и зачеты</AlertTitle>
              <AlertDescription>
                Обнаружено {parsedData.length} экзаменов и зачетов. Проверьте данные перед импортом.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Предпросмотр данных ({parsedData.length} записей)</Label>
              <div className="max-h-60 overflow-y-auto rounded-md border border-border/30 bg-background/30 backdrop-blur-sm p-2">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                    <tr>
                      <th className="p-2 text-left text-xs">Дата</th>
                      <th className="p-2 text-left text-xs">Время</th>
                      <th className="p-2 text-left text-xs">Предмет</th>
                      <th className="p-2 text-left text-xs">Тип</th>
                      <th className="p-2 text-left text-xs">Аудитория</th>
                      <th className="p-2 text-left text-xs">Преподаватель</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData
                      .sort((a, b) => a.fullDateTime.getTime() - b.fullDateTime.getTime())
                      .map((item, idx) => (
                        <tr key={idx} className="border-t border-border/20">
                          <td className="p-2 text-xs">{item.date}</td>
                          <td className="p-2 text-xs">{item.time}</td>
                          <td className="p-2 text-xs">{item.subject}</td>
                          <td className="p-2 text-xs">{getExamTypeBadge(item.examType)}</td>
                          <td className="p-2 text-xs">{item.room}</td>
                          <td className="p-2 text-xs">{item.teacher}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                Будет создано {parsedData.length} записей экзаменов. Это действие нельзя отменить.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Сводка импорта:</h3>
              <div className="max-h-60 overflow-y-auto rounded-md border border-border/30 bg-background/30 backdrop-blur-sm p-4">
                <ul className="space-y-2 text-sm">
                  <li>• Всего записей: {parsedData.length}</li>
                  <li>• Экзаменов: {parsedData.filter((item) => item.examType === "Экзамен").length}</li>
                  <li>• Зачетов: {parsedData.filter((item) => item.examType === "Зачет").length}</li>
                  <li>• Предметы: {[...new Set(parsedData.map((item) => item.subject))].join(", ")}</li>
                  <li>
                    • Период:{" "}
                    {parsedData.length > 0 ? `${parsedData[0].date} - ${parsedData[parsedData.length - 1].date}` : ""}
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 border border-border/30 rounded-md p-4 bg-background/30 backdrop-blur-sm">
              <h3 className="text-sm font-medium mb-2">Настройки импорта:</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                />
                <Label htmlFor="skip-duplicates" className="text-sm">
                  Пропускать дубликаты (по предмету и дате)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Если включена опция "Пропускать дубликаты", система не будет создавать записи для экзаменов, которые уже
                существуют с тем же предметом и датой.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("preview")} className="border-border/30">
                Назад
              </Button>
              <Button onClick={saveExams} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? "Сохранение..." : "Импортировать"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}