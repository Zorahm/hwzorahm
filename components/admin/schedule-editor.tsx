"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Settings, Trash2, Save, Clock, BookOpen, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Week {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

interface ScheduleItem {
  id?: number
  weekId: number
  day: string
  slot: number
  subject: string
  teacher?: string | null
  room?: string | null
  lessonType?: string | null
  customTime?: boolean
  startTime?: string | null
  endTime?: string | null
  isSkipped?: boolean
}

interface ScheduleEditorProps {
  weekId: number
  onSuccess?: () => void
}

export function ScheduleEditor({ weekId, onSuccess }: ScheduleEditorProps) {
  const [week, setWeek] = useState<Week | null>(null)
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleItem[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Обновить массив дней недели с правильными названиями
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]

  // Добавить функцию для получения сокращенного названия дня недели
  const getShortDayName = (day: string): string => {
    const dayMap: Record<string, string> = {
      Понедельник: "Пн",
      Вторник: "Вт",
      Среда: "Ср",
      Четверг: "Чт",
      Пятница: "Пт",
      Суббота: "Сб",
      Воскресенье: "Вс",
    }
    return dayMap[day] || day
  }

  // Обновленный массив слотов, включая нулевую и пятую пару
  const slots = [
    { number: 0, time: "8:30–10:00" },
    { number: 1, time: "10:10–11:40" },
    { number: 2, time: "11:50–13:20" },
    { number: 3, time: "13:50–15:20" },
    { number: 4, time: "15:30–17:00" },
    { number: 5, time: "17:10–18:40" },
  ]

  // Загрузка данных о неделе и расписании
  useEffect(() => {
    const fetchData = async () => {
      if (!weekId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Загрузка информации о неделе
        const weekResponse = await fetch(`/api/weeks/${weekId}`)
        if (!weekResponse.ok) {
          throw new Error("Ошибка при загрузке данных о неделе")
        }
        const weekData = await weekResponse.json()
        setWeek(weekData)

        // Загрузка расписания
        const scheduleResponse = await fetch(`/api/schedule?weekId=${weekId}`)
        if (!scheduleResponse.ok) {
          throw new Error("Ошибка при загрузке расписания")
        }
        const scheduleItems = await scheduleResponse.json()

        // Инициализация пустого расписания для всех дней и слотов
        const initialSchedule: Record<string, ScheduleItem[]> = {}
        days.forEach((day) => {
          initialSchedule[day] = slots.map((slot) => ({
            weekId,
            day,
            slot: slot.number,
            subject: "",
            teacher: null,
            room: null,
            customTime: false,
            startTime: null,
            endTime: null,
            isSkipped: false,
          }))
        })

        // Заполнение расписания существующими данными
        scheduleItems.forEach((item: ScheduleItem) => {
          const dayItems = initialSchedule[item.day]
          const index = dayItems.findIndex((s) => s.slot === item.slot)
          if (index !== -1) {
            dayItems[index] = item
          }
        })

        setScheduleData(initialSchedule)
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

    fetchData()
  }, [weekId, toast])

  // Обработчик изменения предмета
  const handleSubjectChange = (day: string, slot: number, value: string) => {
    setScheduleData((prev) => {
      const newData = { ...prev }
      const dayItems = [...newData[day]]
      const index = dayItems.findIndex((item) => item.slot === slot)

      if (index !== -1) {
        dayItems[index] = { ...dayItems[index], subject: value }
      }

      newData[day] = dayItems
      return newData
    })
  }

  // Обработчик изменения настроек пары
  const handleSettingsChange = (day: string, slot: number, settings: Partial<ScheduleItem>) => {
    setScheduleData((prev) => {
      const newData = { ...prev }
      const dayItems = [...newData[day]]
      const index = dayItems.findIndex((item) => item.slot === slot)

      if (index !== -1) {
        dayItems[index] = { ...dayItems[index], ...settings }
      }

      newData[day] = dayItems
      return newData
    })
  }

  // Удаление записи расписания
  const handleDeleteScheduleItem = async (item: ScheduleItem) => {
    if (!item.id) {
      // Если у записи нет ID, значит она еще не сохранена в базе данных
      // Просто очищаем поле предмета
      handleSubjectChange(item.day, item.slot, "")
      toast({
        title: "Успешно",
        description: "Запись удалена из формы",
      })
      return
    }

    setIsDeleting(true)

    try {
      console.log("Deleting schedule item:", item)
      const response = await fetch(`/api/schedule/${item.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Error response (${response.status}):`, errorData)
        throw new Error(`Ошибка при удалении записи: ${response.status} ${response.statusText}`)
      }

      // Обновляем состояние, удаляя запись из расписания
      setScheduleData((prev) => {
        const newData = { ...prev }
        const dayItems = [...newData[item.day]]
        const index = dayItems.findIndex((i) => i.slot === item.slot)

        if (index !== -1) {
          // Заменяем запись на пустую
          dayItems[index] = {
            weekId,
            day: item.day,
            slot: item.slot,
            subject: "",
            teacher: null,
            room: null,
            customTime: false,
            startTime: null,
            endTime: null,
            isSkipped: false,
          }
        }

        newData[item.day] = dayItems
        return newData
      })

      toast({
        title: "Успешно",
        description: "Запись удалена из расписания",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error deleting schedule item:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось удалить запись",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Сохранение расписания
  const handleSave = async () => {
    if (!weekId) return

    console.log("Starting to save schedule for weekId:", weekId)
    console.log("Schedule data to save:", scheduleData)

    setIsSaving(true)

    try {
      // Собираем все записи расписания
      const allItems: ScheduleItem[] = []
      Object.values(scheduleData).forEach((dayItems) => {
        dayItems.forEach((item) => {
          if (item.subject.trim()) {
            allItems.push(item)
          }
        })
      })

      // Сохраняем каждую запись
      for (const item of allItems) {
        const method = item.id ? "PATCH" : "POST"
        const url = item.id ? `/api/schedule/${item.id}` : "/api/schedule"

        console.log(`Saving item using ${method} to ${url}:`, item)

        try {
          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error(`Error response (${response.status}):`, errorData)
            throw new Error(
              `Ошибка при сохранении записи: ${item.day}, пара ${item.slot} - ${response.status} ${response.statusText}`,
            )
          }

          const savedData = await response.json()
          console.log("Successfully saved item:", savedData)
        } catch (error) {
          console.error("Error during fetch:", error)
          throw error
        }
      }

      toast({
        title: "Успешно",
        description: "Расписание сохранено",
      })

      if (onSuccess) {
        onSuccess()
      }

      // Перенаправление на страницу расписания
      router.push(`/schedule?weekId=${weekId}`)
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить расписание",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 bg-secondary/30 rounded-lg mb-6"></div>
        {Array.from({ length: 3 }).map((_, dayIndex) => (
          <div key={dayIndex} className="space-y-3 animate-pulse">
            <div className="h-6 w-32 bg-secondary/50 rounded-md"></div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, slotIndex) => (
                <div key={slotIndex} className="flex items-center gap-4">
                  <div className="w-32 h-5 bg-secondary/30 rounded-md"></div>
                  <div className="flex-1 h-10 bg-secondary/20 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!week) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-1">Выберите неделю</h3>
        <p className="text-muted-foreground">Сначала выберите неделю для редактирования расписания</p>
      </div>
    )
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("ru-RU")} - ${end.toLocaleDateString("ru-RU")}`
  }

  return (
    <div className="space-y-6">
      <Card className="admin-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-xl font-bold mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2>Редактировать расписание</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Неделя {week.name} ({formatDateRange(week.startDate, week.endDate)})
          </p>

          <div className="text-sm text-muted-foreground mb-6">
            Введите предметы для каждой пары. Пустые поля не будут сохранены. Нажмите на иконку шестеренки для настройки
            дополнительных параметров или на иконку корзины для удаления записи.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day} className="space-y-3">
            <h4 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{getShortDayName(day)}</span>
            </h4>
            <div className="space-y-2">
              {slots.map((slot) => {
                const scheduleItem = scheduleData[day]?.find((item) => item.slot === slot.number) || {
                  weekId,
                  day,
                  slot: slot.number,
                  subject: "",
                  teacher: null,
                  room: null,
                  customTime: false,
                  startTime: null,
                  endTime: null,
                  isSkipped: false,
                }

                return (
                  <div key={`${day}-${slot.number}`} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary/70" />
                      <span className="font-medium">{slot.number === 0 ? "0" : slot.number}.</span> {slot.time}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={scheduleItem.subject || ""}
                        onChange={(e) => handleSubjectChange(day, slot.number, e.target.value)}
                        placeholder={`Предмет на ${slot.number === 0 ? "0" : slot.number}-ю пару`}
                        className="flex-1 border-border/60 bg-background/30 backdrop-blur-sm"
                      />

                      {scheduleItem.subject && (
                        <div className="flex gap-1 items-center">
                          {scheduleItem.room && (
                            <Badge variant="soft" className="h-6 gap-1">
                              <MapPin className="h-3 w-3" />
                              {scheduleItem.room}
                            </Badge>
                          )}

                          {scheduleItem.lessonType && (
                            <Badge variant="outline" className="h-6 gap-1">
                              <BookOpen className="h-3 w-3" />
                              {scheduleItem.lessonType}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-border/60 bg-background/30 backdrop-blur-sm hover:bg-secondary"
                            title="Настройки пары"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-border/30 bg-card/95 backdrop-blur-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                                <Settings className="h-3 w-3 text-primary" />
                              </div>
                              Настройки пары
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="form-group">
                              <Label
                                htmlFor={`teacher-${day}-${slot.number}`}
                                className="form-label flex items-center gap-2"
                              >
                                <BookOpen className="h-4 w-4 text-primary" />
                                Преподаватель
                              </Label>
                              <Input
                                id={`teacher-${day}-${slot.number}`}
                                value={scheduleItem.teacher || ""}
                                onChange={(e) => handleSettingsChange(day, slot.number, { teacher: e.target.value })}
                                placeholder="ФИО преподавателя"
                                className="border-border/30 bg-background/30 backdrop-blur-sm"
                              />
                            </div>

                            <div className="form-group">
                              <Label
                                htmlFor={`room-${day}-${slot.number}`}
                                className="form-label flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4 text-primary" />
                                Аудитория
                              </Label>
                              <Input
                                id={`room-${day}-${slot.number}`}
                                value={scheduleItem.room || ""}
                                onChange={(e) => handleSettingsChange(day, slot.number, { room: e.target.value })}
                                placeholder="Номер аудитории"
                                className="border-border/30 bg-background/30 backdrop-blur-sm"
                              />
                            </div>

                            <div className="form-group">
                              <Label
                                htmlFor={`lesson-type-${day}-${slot.number}`}
                                className="form-label flex items-center gap-2"
                              >
                                <BookOpen className="h-4 w-4 text-primary" />
                                Тип занятия
                              </Label>
                              <Select
                                value={scheduleItem.lessonType || ""}
                                onValueChange={(value) => handleSettingsChange(day, slot.number, { lessonType: value })}
                              >
                                <SelectTrigger className="border-border/30 bg-background/30 backdrop-blur-sm">
                                  <SelectValue placeholder="Выберите тип занятия" />
                                </SelectTrigger>
                                <SelectContent className="border-border/30 bg-card/95 backdrop-blur-md">
                                  <SelectItem value="Не указан">Не указан</SelectItem>
                                  <SelectItem value="Лекция">Лекция</SelectItem>
                                  <SelectItem value="Практика">Практика</SelectItem>
                                  <SelectItem value="Лабораторная">Лабораторная работа</SelectItem>
                                  <SelectItem value="Консультация">Консультация</SelectItem>
                                  <SelectItem value="Пересдача">Пересдача</SelectItem>
                                  <SelectItem value="Экзамен">Экзамен</SelectItem>
                                  <SelectItem value="Зачет">Зачет</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`custom-time-${day}-${slot.number}`}
                                checked={scheduleItem.customTime}
                                onCheckedChange={(checked) =>
                                  handleSettingsChange(day, slot.number, {
                                    customTime: checked === true,
                                  })
                                }
                              />
                              <Label htmlFor={`custom-time-${day}-${slot.number}`} className="text-sm">
                                Кастомное время
                              </Label>
                            </div>

                            {scheduleItem.customTime && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                  <Label
                                    htmlFor={`start-time-${day}-${slot.number}`}
                                    className="form-label flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4 text-primary" />
                                    Время начала
                                  </Label>
                                  <Input
                                    id={`start-time-${day}-${slot.number}`}
                                    type="time"
                                    value={scheduleItem.startTime || ""}
                                    onChange={(e) =>
                                      handleSettingsChange(day, slot.number, {
                                        startTime: e.target.value,
                                      })
                                    }
                                    className="border-border/30 bg-background/30 backdrop-blur-sm"
                                  />
                                </div>
                                <div className="form-group">
                                  <Label
                                    htmlFor={`end-time-${day}-${slot.number}`}
                                    className="form-label flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4 text-primary" />
                                    Время окончания
                                  </Label>
                                  <Input
                                    id={`end-time-${day}-${slot.number}`}
                                    type="time"
                                    value={scheduleItem.endTime || ""}
                                    onChange={(e) =>
                                      handleSettingsChange(day, slot.number, {
                                        endTime: e.target.value,
                                      })
                                    }
                                    className="border-border/30 bg-background/30 backdrop-blur-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="gradient">Готово</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Кнопка удаления записи */}
                      {scheduleItem.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 border-border/60 bg-background/30 backdrop-blur-sm hover:bg-destructive/20 hover:text-destructive"
                              title="Удалить запись"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-md text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Вы уверены, что хотите удалить запись "{scheduleItem.subject}" из расписания? Это
                                действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border/60 bg-background/30 text-white hover:bg-secondary">
                                Отмена
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteScheduleItem(scheduleItem)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Удаление..." : "Удалить"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} variant="gradient" className="gap-2" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Сохранить расписание
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
