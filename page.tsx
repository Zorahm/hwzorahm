"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { WeekSelector } from "@/components/week-selector"
import { ScheduleView } from "@/components/schedule-view"
import { HomeworkList } from "@/components/homework-list"
import { ExamsList } from "@/components/exams-list"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, ClipboardList, GraduationCap, ChevronRight, BookOpen, ArrowRight, CalendarDays, Timer } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { AnnouncementsWidget } from "@/components/announcements-widget"
import { Progress } from "@/components/ui/progress"

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

export default function Dashboard() {
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null)
  const [selectedWeekId, setSelectedWeekId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([])
  const [weekSchedule, setWeekSchedule] = useState<ScheduleItem[]>([])
  const [currentLesson, setCurrentLesson] = useState<ScheduleItem | null>(null)
  const [nextLesson, setNextLesson] = useState<ScheduleItem | null>(null)
  const [remainingTime, setRemainingTime] = useState<string>("")
  const [schoolDaysLeft, setSchoolDaysLeft] = useState<number>(0)
  const [weekProgress, setWeekProgress] = useState<number>(0)
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const isMobile = useMobile()

  // Стандартное время пар
  const standardTimes = [
    { slot: 0, start: "08:30", end: "10:00" },
    { slot: 1, start: "10:10", end: "11:40" },
    { slot: 2, start: "11:50", end: "13:20" },
    { slot: 3, start: "13:50", end: "15:20" },
    { slot: 4, start: "15:30", end: "17:00" },
    { slot: 5, start: "17:10", end: "18:40" },
  ]

  // Дни недели
  const daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]

  useEffect(() => {
    const fetchCurrentWeek = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/weeks/current")

        if (!response.ok) {
          throw new Error("Ошибка при загрузке текущей недели")
        }

        const data = await response.json()
        setCurrentWeek(data)
        setSelectedWeekId(data.id)
      } catch (error) {
        console.error("Error fetching current week:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить текущую неделю",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentWeek()

    // Обновление текущего времени каждую минуту
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [toast])

  // Загрузка расписания на неделю при изменении выбранной недели
  useEffect(() => {
    const fetchWeekSchedule = async () => {
      if (!selectedWeekId) return

      try {
        const response = await fetch(`/api/schedule?weekId=${selectedWeekId}`)
        if (!response.ok) {
          throw new Error("Ошибка при загрузке расписания")
        }

        const scheduleData = await response.json()
        setWeekSchedule(scheduleData)

        // Получаем текущий день недели
        const today = new Date()
        const dayOfWeek = daysOfWeek[today.getDay()]

        // Фильтруем расписание только для текущего дня
        const todayLessons = scheduleData.filter((item: ScheduleItem) => item.day === dayOfWeek)

        // Сортируем по номеру пары
        todayLessons.sort((a: ScheduleItem, b: ScheduleItem) => a.slot - b.slot)

        setTodaySchedule(todayLessons)

        // Подсчет оставшихся учебных дней на основе расписания
        calculateRemainingSchoolDays(scheduleData)

        // Подсчет прогресса недели
        calculateWeekProgress()
      } catch (error) {
        console.error("Error fetching schedule:", error)
      }
    }

    fetchWeekSchedule()
  }, [selectedWeekId, currentTime])

  // Определение текущей и следующей пары
  useEffect(() => {
    if (todaySchedule.length === 0) {
      setCurrentLesson(null)
      setNextLesson(null)
      setRemainingTime("")
      return
    }

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTimeMinutes = hours * 60 + minutes

    // Проверяем каждую пару в расписании
    let current = null
    let next = null

    for (const lesson of todaySchedule) {
      // Получаем время начала и окончания пары
      let startTime, endTime

      if (lesson.customTime && lesson.startTime && lesson.endTime) {
        // Используем кастомное время, если оно задано
        startTime = lesson.startTime
        endTime = lesson.endTime
      } else {
        // Иначе используем стандартное время для этого слота
        const slotTime = standardTimes.find((time) => time.slot === lesson.slot)
        if (slotTime) {
          startTime = slotTime.start
          endTime = slotTime.end
        } else {
          continue // Пропускаем, если не можем определить время
        }
      }

      // Преобразуем время в минуты
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)
      const startTimeMinutes = startHour * 60 + startMinute
      const endTimeMinutes = endHour * 60 + endMinute

      // Проверяем, идет ли сейчас эта пара
      if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes) {
        current = lesson

        // Вычисляем оставшееся время
        const remainingMinutes = endTimeMinutes - currentTimeMinutes
        const remainingHours = Math.floor(remainingMinutes / 60)
        const remainingMins = remainingMinutes % 60

        if (remainingHours > 0) {
          setRemainingTime(`${remainingHours} ч ${remainingMins} мин`)
        } else {
          setRemainingTime(`${remainingMins} мин`)
        }
      }

      // Проверяем, является ли эта пара следующей
      if (
        currentTimeMinutes < startTimeMinutes &&
        (!next ||
          startTimeMinutes <
            (next.customTime && next.startTime
              ? next.startTime.split(":").map(Number)[0] * 60 + next.startTime.split(":").map(Number)[1]
              : standardTimes
                  .find((time) => time.slot === next.slot)
                  ?.start.split(":")
                  .map(Number)[0] *
                  60 +
                standardTimes
                  .find((time) => time.slot === next.slot)
                  ?.start.split(":")
                  .map(Number)[1]))
      ) {
        next = lesson
      }
    }

    setCurrentLesson(current)
    setNextLesson(next)
  }, [todaySchedule, currentTime])

  // Функция для подсчета оставшихся учебных дней на основе расписания
  const calculateRemainingSchoolDays = (scheduleData: ScheduleItem[]) => {
    if (!currentWeek) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const end = new Date(currentWeek.endDate)
    end.setHours(23, 59, 59, 999)

    // Если текущая дата позже конца недели, возвращаем 0
    if (today > end) {
      setSchoolDaysLeft(0)
      return
    }

    // Получаем уникальные дни, в которые есть занятия
    const uniqueDays = new Set<string>()
    scheduleData.forEach((item) => {
      if (item.subject.trim()) {
        uniqueDays.add(item.day)
      }
    })

    // Преобразуем названия дней в номера дней недели
    const dayNumbers = Array.from(uniqueDays)
      .map((day) => {
        return daysOfWeek.indexOf(day)
      })
      .filter((num) => num > 0) // Исключаем воскресенье (0)

    // Подсчитываем оставшиеся учебные дни
    let count = 0
    const currentDate = new Date(today)

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()

      // Проверяем, является ли день учебным по расписанию
      if (dayNumbers.includes(dayOfWeek)) {
        count++
      }

      // Переходим к следующему дню
      currentDate.setDate(currentDate.getDate() + 1)
    }

    setSchoolDaysLeft(count)
  }

  // Функция для подсчета прогресса недели
  const calculateWeekProgress = () => {
    if (!currentWeek) return

    const now = new Date()
    const start = new Date(currentWeek.startDate)
    const end = new Date(currentWeek.endDate)

    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()

    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
    setWeekProgress(progress)
  }

  const handleWeekChange = (weekId: number) => {
    setSelectedWeekId(weekId)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("ru-RU")} - ${end.toLocaleDateString("ru-RU")}`
  }

  // Функция для получения цвета типа занятия
  const getLessonTypeColor = (type: string | null | undefined) => {
    if (!type) return "bg-gray-400"

    switch (type) {
      case "Лекция":
        return "bg-blue-400"
      case "Практика":
        return "bg-green-400"
      case "Лабораторная":
        return "bg-purple-400"
      case "Консультация":
        return "bg-yellow-400"
      case "Пересдача":
        return "bg-red-400"
      case "Экзамен":
      case "Зачет":
        return "bg-orange-400"
      default:
        return "bg-gray-400"
    }
  }

  // Функция для получения времени пары
  const getLessonTime = (lesson: ScheduleItem) => {
    if (lesson.customTime && lesson.startTime && lesson.endTime) {
      return `${lesson.startTime} - ${lesson.endTime}`
    }

    const slotTime = standardTimes.find((time) => time.slot === lesson.slot)
    return slotTime ? `${slotTime.start} - ${slotTime.end}` : ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
          <p className="text-gray-400">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-medium tracking-tight flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <span>Дашборд</span>
        </h1>
        <WeekSelector onWeekChange={handleWeekChange} initialWeekId={currentWeek?.id} filter="current-future" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Обновленный виджет текущей недели */}
        <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
          <div className="border-b border-white/10 p-6 relative z-10">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <CalendarDays className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-xl font-semibold">Текущая неделя</div>
                <div className="text-sm text-gray-400 mt-1">Академический календарь</div>
              </div>
            </CardTitle>
          </div>
          <CardContent className="p-6 relative z-10">
            {currentWeek && (
              <div className="space-y-6">
                {/* Основная информация о неделе */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{currentWeek.name}</h3>
                    <Badge
                      variant="outline"
                      className="bg-white/10 border-blue-500/30 text-blue-300 text-sm px-3 py-1"
                    >
                      {formatDateRange(currentWeek.startDate, currentWeek.endDate)}
                    </Badge>
                  </div>

                  {/* Прогресс недели */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Прогресс недели</span>
                      <span className="font-medium text-white">{Math.round(weekProgress)}%</span>
                    </div>
                    <Progress value={weekProgress} className="h-2 bg-white/10" />
                  </div>

                  {/* Статистика недели */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                          <Calendar className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{schoolDaysLeft}</div>
                          <div className="text-xs text-gray-400">
                            Учебных{" "}
                            {schoolDaysLeft === 1
                              ? "день"
                              : schoolDaysLeft >= 2 && schoolDaysLeft <= 4
                                ? "дня"
                                : "дней"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <Timer className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {currentTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-xs text-gray-400">Текущее время</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Информация о текущей паре */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Расписание на сегодня
                  </h4>

                  {currentLesson ? (
                    <div className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`h-3 w-3 rounded-full ${getLessonTypeColor(currentLesson.lessonType)}`}
                        ></div>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Сейчас идет пара
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-lg text-white">{currentLesson.subject}</h5>
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-400">
                          <div className="flex items-center justify-between">
                            <span>{getLessonTime(currentLesson)}</span>
                            <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300">
                              До конца: {remainingTime}
                            </Badge>
                          </div>
                          {currentLesson.teacher && <div>Преподаватель: {currentLesson.teacher}</div>}
                          {currentLesson.room && <div>Аудитория: {currentLesson.room}</div>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm text-center">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-400">Сейчас нет пары по расписанию</p>
                    </div>
                  )}

                  {/* Информация о следующей паре */}
                  {nextLesson && (
                    <div className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`h-3 w-3 rounded-full ${getLessonTypeColor(nextLesson.lessonType)}`}
                        ></div>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                          Следующая пара
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-white">{nextLesson.subject}</h5>
                        <div className="grid grid-cols-1 gap-1 text-sm text-gray-400">
                          <div>{getLessonTime(nextLesson)}</div>
                          {nextLesson.teacher && <div>Преподаватель: {nextLesson.teacher}</div>}
                          {nextLesson.room && <div>Аудитория: {nextLesson.room}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <GraduationCap className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-xl font-semibold">Ближайшие экзамены</div>
                <div className="text-sm text-gray-400 mt-1">Подготовьтесь заранее</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExamsList limit={2} />
            <div className="mt-4 text-right">
              <Button variant="ghost" size="sm" asChild className="text-blue-400 hover:bg-blue-500/20">
                <Link href="/exams" className="flex items-center gap-1">
                  Все экзамены
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Расписание на всю ширину */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <div className="text-xl font-semibold">Расписание на неделю</div>
                <div className="text-sm text-gray-400 mt-1">
                  {currentWeek ? currentWeek.name : "Загрузка..."}
                </div>
              </div>
            </CardTitle>
          </div>
          {isAdmin && (
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
            >
              <Link href="/admin?tab=schedule">
                <span className={isMobile ? "" : "mr-2"}>{isMobile ? "" : "Управление расписанием"}</span>
                {isMobile && <ArrowRight className="h-4 w-4" />}
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScheduleView weekId={selectedWeekId} />
          <CardFooter className="px-0 pt-4 pb-0 mt-4 flex justify-end">
            <Button variant="ghost" size="sm" asChild className="text-blue-400 hover:bg-blue-500/20">
              <Link href="/schedule" className="flex items-center gap-1">
                Полное расписание
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </CardContent>
      </Card>

      {/* Домашние задания и объявления */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                    <ClipboardList className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">Домашние задания</div>
                    <div className="text-sm text-gray-400 mt-1">Не забудьте про дедлайны</div>
                  </div>
                </CardTitle>
              </div>
              {isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  <Link href="/admin?tab=homework">
                    <span className={isMobile ? "" : "mr-2"}>{isMobile ? "" : "Управление ДЗ"}</span>
                    {isMobile && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <HomeworkList weekId={selectedWeekId} />
              <CardFooter className="px-0 pt-4 pb-0 mt-4 flex justify-end">
                <Button variant="ghost" size="sm" asChild className="text-blue-400 hover:bg-blue-500/20">
                  <Link href="/homework" className="flex items-center gap-1">
                    Все домашние задания
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-4">
          <AnnouncementsWidget />
        </div>
      </div>
    </div>
  )
}