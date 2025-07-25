"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Clock, Trash2, Plus, FileText, Calendar, BookOpen, Pencil, ArrowLeft } from "lucide-react"
import { HomeworkForm } from "@/components/admin/homework-form"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ScheduleItem {
  id: number
  weekId: number
  day: string
  slot: number
  subject: string
  teacher: string | null
  room: string | null
  customTime: boolean
  startTime: string | null
  endTime: string | null
  isSkipped: boolean
}

interface HomeworkFile {
  id?: number
  filename: string
  fileUrl: string
}

// Обновляем интерфейс Homework, чтобы включить scheduleId
interface Homework {
  id: number
  weekId: number
  subject: string
  description: string
  shortDescription?: string | null
  detailedDescription?: string | null
  deadline: string
  fileUrl: string | null
  files?: HomeworkFile[]
  scheduleId?: number | null // Добавляем scheduleId
}

interface AdminHomeworkProps {
  weekId?: number
}

export function AdminHomework({ weekId }: AdminHomeworkProps) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [homeworkItems, setHomeworkItems] = useState<Homework[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState<string | null>(null)
  const [selectedHomeworkTitle, setSelectedHomeworkTitle] = useState<string | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { toast } = useToast()
  // Добавляем состояние для хранения выбранного scheduleId
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)

  // Загрузка расписания и домашних заданий
  const fetchData = async () => {
    if (!weekId) {
      setScheduleItems([])
      setHomeworkItems([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Загрузка расписания
      const scheduleResponse = await fetch(`/api/schedule?weekId=${weekId}`)
      if (!scheduleResponse.ok) {
        throw new Error("Ошибка при загрузке расписания")
      }
      const scheduleData = await scheduleResponse.json()
      setScheduleItems(scheduleData)

      // Загрузка домашних заданий
      const homeworkResponse = await fetch(`/api/homework?weekId=${weekId}`)
      if (!homeworkResponse.ok) {
        throw new Error("Ошибка при загрузке домашних заданий")
      }
      const homeworkData = await homeworkResponse.json()
      setHomeworkItems(homeworkData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Исправляем useEffect, чтобы избежать бесконечного цикла
  // Удаляем toast из зависимостей, так как он не должен вызывать повторные запросы
  useEffect(() => {
    fetchData()
  }, [weekId]) // Удаляем toast из зависимостей

  // Обработчик удаления домашнего задания
  const handleDeleteHomework = async (homeworkId: number) => {
    if (!confirm("Вы уверены, что хотите удалить это домашнее задание? Это действие нельзя отменить.")) {
      return
    }

    try {
      const response = await fetch(`/api/homework/${homeworkId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Ошибка при удалении домашнего задания")
      }

      toast({
        title: "Успешно",
        description: "Домашнее задание удалено",
      })

      // Обновить список домашних заданий
      fetchData()
    } catch (error) {
      console.error("Error deleting homework:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить домашнее задание",
        variant: "destructive",
      })
    }
  }

  // Обработчик успешного добавления/редактирования домашнего задания
  const handleFormSuccess = () => {
    setIsFormVisible(false)
    setSelectedSubject(null)
    setSelectedHomework(null)
    fetchData()
  }

  // Получение времени по слоту
  const getTimeBySlot = (slot: number): string => {
    switch (slot) {
      case 0:
        return "8:30–10:00"
      case 1:
        return "10:10–11:40"
      case 2:
        return "11:50–13:20"
      case 3:
        return "13:50–15:20"
      case 4:
        return "15:30–17:00"
      case 5:
        return "17:10–18:40"
      default:
        return ""
    }
  }

  // Группировка расписания по дням
  const scheduleByDay = scheduleItems.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = []
    }
    acc[item.day].push(item)
    return acc
  }, {})

  // Сортировка дней недели
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
  const sortedDays = Object.keys(scheduleByDay).sort((a, b) => days.indexOf(a) - days.indexOf(b))

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Проверка, есть ли уже домашнее задание для предмета
  const hasHomework = (subject: string) => {
    return homeworkItems.some((hw) => hw.subject === subject)
  }

  // Получение домашнего задания по предмету
  const getHomeworkBySubject = (subject: string) => {
    return homeworkItems.find((hw) => hw.subject === subject)
  }

  // Обновляем функцию openAddForm, чтобы передавать scheduleId
  const openAddForm = (subject: string, scheduleId?: number) => {
    setSelectedSubject(subject)
    setSelectedHomework(null)
    setSelectedScheduleId(scheduleId) // Добавляем состояние для хранения выбранного scheduleId
    setIsFormVisible(true)
  }

  // Открытие формы для редактирования ДЗ
  const openEditForm = (homework: Homework) => {
    setSelectedHomework(homework)
    setSelectedSubject(homework.subject)
    setSelectedScheduleId(homework.scheduleId || null) // Сохраняем scheduleId
    setIsFormVisible(true)
  }

  // Открытие диалога с подробным описанием
  const openDetailsDialog = (description: string, subject: string) => {
    setSelectedDetails(description)
    setSelectedHomeworkTitle(subject)
    setDetailsDialogOpen(true)
  }

  // Обновляем отображение формы, чтобы передавать scheduleId
  if (isFormVisible) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button variant="outline" onClick={() => setIsFormVisible(false)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Вернуться к списку</span>
            <span className="sm:hidden">Назад</span>
          </Button>
          <h2 className="text-lg sm:text-xl font-medium">
            {selectedHomework ? "Редактирование задания" : "Добавление задания"}
          </h2>
        </div>

        <div className="bg-secondary/10 rounded-lg p-3 sm:p-4 border border-border/30">
          <HomeworkForm
            homeworkId={selectedHomework?.id}
            weekId={weekId}
            subject={selectedSubject || undefined}
            scheduleId={selectedScheduleId || undefined} // Передаем scheduleId
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormVisible(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-medium mb-1 sm:mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Управление домашними заданиями
        </h2>
        <p className="text-sm text-muted-foreground">
          {weekId
            ? "Создавайте и редактируйте домашние задания для выбранной недели"
            : "Выберите неделю для управления домашними заданиями"}
        </p>
      </div>

      {/* Диалог с подробным описанием */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] border-border/30 bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {selectedHomeworkTitle} - Подробное описание
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none">
            <MarkdownRenderer content={selectedDetails || ""} />
          </div>
        </DialogContent>
      </Dialog>

      {!weekId ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4 opacity-30" />
          <h3 className="text-base sm:text-lg font-medium mb-1">Выберите неделю</h3>
          <p className="text-sm text-muted-foreground">Сначала выберите неделю для управления домашними заданиями</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, dayIndex) => (
            <div key={dayIndex} className="space-y-2 animate-pulse">
              <div className="h-6 w-32 bg-secondary/50 rounded-md"></div>
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, itemIndex) => (
                  <Card key={itemIndex} className="bg-secondary/20">
                    <CardContent className="p-3 sm:p-4">
                      <div className="h-6 w-3/4 bg-secondary/50 rounded-md mb-3"></div>
                      <div className="h-4 w-1/2 bg-secondary/30 rounded-md"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : scheduleItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4 opacity-30" />
          <h3 className="text-base sm:text-lg font-medium mb-1">Нет расписания</h3>
          <p className="text-sm text-muted-foreground mb-4">Сначала добавьте расписание для этой недели</p>
          <Button variant="default" asChild className="gap-2">
            <a href={`/admin?tab=schedule&weekId=${weekId}`}>
              <Plus className="h-4 w-4" />
              Добавить расписание
            </a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {sortedDays.map((day) => (
            <div key={day} className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {day}
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {scheduleByDay[day]
                  .sort((a, b) => a.slot - b.slot)
                  .map((item) => {
                    // Найти домашнее задание для этого предмета
                    const homework = getHomeworkBySubject(item.subject)

                    return (
                      <Card
                        key={item.id}
                        className={`admin-card border-border/30 transition-colors ${
                          selectedSubject === item.subject ? "bg-primary/5" : ""
                        }`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className="h-6 gap-1 bg-secondary/50">
                                  <Clock className="h-3 w-3" />
                                  {item.slot}.{" "}
                                  {item.customTime && item.startTime && item.endTime
                                    ? `${item.startTime}–${item.endTime}`
                                    : getTimeBySlot(item.slot)}
                                </Badge>
                                <h4 className="font-medium text-base sm:text-lg">{item.subject}</h4>
                              </div>
                              {/* Проверяем, есть ли домашнее задание для этого конкретного элемента расписания */}
                              {homeworkItems.some((hw) => hw.scheduleId === item.id) ? (
                                homeworkItems
                                  .filter((hw) => hw.scheduleId === item.id)
                                  .map((homework) => (
                                    <div key={homework.id} className="mt-2 sm:mt-3">
                                      <p className="text-sm text-foreground/90">
                                        {homework.shortDescription || homework.description}
                                      </p>
                                      <p className="mt-1 sm:mt-2 text-xs flex items-center text-primary">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Срок сдачи: {formatDate(homework.deadline)}
                                      </p>

                                      {/* Отображение файлов */}
                                      {(homework.files?.length > 0 || homework.fileUrl) && (
                                        <div className="mt-1 sm:mt-2 flex flex-wrap gap-2">
                                          {homework.files?.map((file, index) => (
                                            <a
                                              key={index}
                                              href={file.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                              <FileText className="h-3 w-3" />
                                              {file.filename}
                                            </a>
                                          ))}
                                          {homework.fileUrl && !homework.files?.length && (
                                            <a
                                              href={homework.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                              <FileText className="h-3 w-3" />
                                              Файл
                                            </a>
                                          )}
                                        </div>
                                      )}

                                      {/* Кнопка для просмотра подробного описания */}
                                      {homework.detailedDescription && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          onClick={() =>
                                            openDetailsDialog(homework.detailedDescription || "", homework.subject)
                                          }
                                          className="mt-1 h-auto p-0 text-xs text-primary"
                                        >
                                          Подробное описание
                                        </Button>
                                      )}
                                    </div>
                                  ))
                              ) : (
                                // Если нет домашнего задания для этого элемента расписания
                                <div className="mt-2 sm:mt-3 text-sm text-muted-foreground">
                                  Нет домашнего задания для этого дня
                                </div>
                              )}
                            </div>
                            <div className="action-buttons flex sm:flex-col gap-2 mt-2 sm:mt-0">
                              {/* Проверяем, есть ли домашнее задание для этого конкретного элемента расписания */}
                              {homeworkItems.some((hw) => hw.scheduleId === item.id) ? (
                                homeworkItems
                                  .filter((hw) => hw.scheduleId === item.id)
                                  .map((homework) => (
                                    <div key={homework.id} className="flex gap-2 w-full">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditForm(homework)}
                                        className="h-8 gap-1 flex-1 sm:flex-none"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Изменить</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteHomework(homework.id)}
                                        className="h-8 gap-1 flex-1 sm:flex-none text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Удалить</span>
                                      </Button>
                                    </div>
                                  ))
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => openAddForm(item.subject, item.id)} // Передаем scheduleId
                                  className="h-8 gap-1 w-full sm:w-auto"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Добавить ДЗ</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
