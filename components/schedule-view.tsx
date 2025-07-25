"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, User, LayoutGrid, Timer } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Интерфейсы и типы без изменений
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
  lessonType: string | null
}

interface ScheduleViewProps {
  weekId?: number
}

type ViewLayout = "subject" | "time"

export function ScheduleView({ weekId }: ScheduleViewProps) {
  // Вся логика и хуки сохранены
  const getCurrentDay = (): string => {
    const today = new Date()
    const dayIndex = today.getDay()
    const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
    return dayIndex === 0 ? "Понедельник" : daysMap[dayIndex]
  }

  const isMobile = useMobile()
  const [activeDay, setActiveDay] = useState(() => isMobile ? getCurrentDay() : "Понедельник")
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleItem[]>>({})
  const [customTimeSchedule, setCustomTimeSchedule] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasZeroPeriod, setHasZeroPeriod] = useState(false)
  const [hasFifthPeriod, setHasFifthPeriod] = useState(false)
  const { toast } = useToast()
  
  const [viewLayout, setViewLayout] = useState<ViewLayout>("time")

  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]

  const getShortDayName = (day: string): string => {
    const dayMap: Record<string, string> = { Понедельник: "Пн", Вторник: "Вт", Среда: "Ср", Четверг: "Чт", Пятница: "Пт", Суббота: "Сб", Воскресенье: "Вс" }
    return dayMap[day] || day
  }

  useEffect(() => {
    if (isMobile) {
      setActiveDay(getCurrentDay())
    } else {
      setActiveDay("Понедельник")
    }
  }, [isMobile])

  // Логика запроса данных без изменений
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)
        const url = weekId ? `/api/schedule?weekId=${weekId}` : "/api/schedule"
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Ошибка при загрузке расписания")
        }
        const data: ScheduleItem[] = await response.json()
        setHasZeroPeriod(data.some((item) => item.slot === 0))
        setHasFifthPeriod(data.some((item) => item.slot === 5))
        setCustomTimeSchedule(data.filter((item) => item.customTime && !item.isSkipped))
        const groupedByDay: Record<string, ScheduleItem[]> = {}
        days.forEach((day) => {
          groupedByDay[day] = data.filter((item) => item.day === day).sort((a, b) => a.slot - b.slot)
        })
        setScheduleData(groupedByDay)
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast({ title: "Ошибка", description: "Не удалось загрузить расписание", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchSchedule()
  }, [weekId, toast])

  const getTimeBySlot = (slot: number): string => {
    switch (slot) {
      case 0: return "8:30–10:00"
      case 1: return "10:10–11:40"
      case 2: return "11:50–13:20"
      case 3: return "13:50–15:20"
      case 4: return "15:30–17:00"
      case 5: return "17:10–18:40"
      default: return ""
    }
  }

  const getLessonTypeBadge = (type: string | null) => {
    if (!type) return null
    let className = "border-gray-500 bg-gray-500/10 text-gray-300"
    if (type.toLowerCase().includes("лекция")) className = "border-blue-500 bg-blue-500/10 text-blue-400"
    else if (type.toLowerCase().includes("практика")) className = "border-green-500 bg-green-500/10 text-green-400"
    else if (type.toLowerCase().includes("лабораторная")) className = "border-purple-500 bg-purple-500/10 text-purple-400"
    else if (type.toLowerCase().includes("пересдача")) className = "border-red-500 bg-red-500/10 text-red-400"
    else if (type.toLowerCase().includes("консультация")) className = "border-yellow-500 bg-yellow-500/10 text-yellow-400"
    else if (type.toLowerCase().includes("экзамен") || type.toLowerCase().includes("зачет")) className = "border-orange-500 bg-orange-500/10 text-orange-400"
    return <Badge variant="outline" className={`px-2 py-0.5 ${className} text-xs font-normal`}>{type}</Badge>
  }

  const getSlots = () => {
    const slots = [1, 2, 3, 4]
    if (hasZeroPeriod) slots.unshift(0)
    if (hasFifthPeriod) slots.push(5)
    return slots
  }
  const slots = getSlots()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-400">Загрузка расписания...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-gray-200">
      {customTimeSchedule.length > 0 && (
        <Card className="bg-[#2D2D3A] border-gray-700/50 rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2.5 text-white">
              <Clock className="h-5 w-5 text-blue-500" />
              Пары с измененным временем
            </h3>
            <div className="space-y-3">
              {customTimeSchedule.map((lesson) => (
                <div key={`custom-${lesson.id}`} className="flex items-center justify-between rounded-lg bg-[#3a3a4a] p-3 hover:bg-[#454555] transition-colors">
                  <div>
                    <div className="font-medium flex items-center gap-3 text-white">
                      {lesson.subject}
                      {!isMobile && getLessonTypeBadge(lesson.lessonType)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{lesson.day}, {lesson.slot}-я пара</div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                      {lesson.teacher && <div className="flex items-center gap-1.5"><User className="h-4 w-4 text-blue-500" />{lesson.teacher}</div>}
                      {!isMobile && lesson.room && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-blue-500" />{lesson.room}</div>}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md whitespace-nowrap">{lesson.startTime}–{lesson.endTime}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isMobile && (
        <div className="flex justify-between items-center mt-2">
          <h2 className="text-2xl font-bold text-white">Расписание на неделю</h2>
          <div className="flex items-center gap-1 rounded-lg bg-[#2D2D3A] p-1 border border-gray-700/50">
            <Button onClick={() => setViewLayout('subject')} variant="ghost" className={`px-3 py-1 h-auto text-sm rounded-md transition-all ${viewLayout === 'subject' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-400 hover:bg-[#3a3a4a] hover:text-white'}`}>
              <LayoutGrid className="h-4 w-4 mr-2"/>По предметам
            </Button>
            <Button onClick={() => setViewLayout('time')} variant="ghost" className={`px-3 py-1 h-auto text-sm rounded-md transition-all ${viewLayout === 'time' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-400 hover:bg-[#3a3a4a] hover:text-white'}`}>
              <Timer className="h-4 w-4 mr-2"/>По времени
            </Button>
          </div>
        </div>
      )}

      {isMobile ? (
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-6 bg-[#2D2D3A] rounded-lg p-1 border border-gray-700/50">
            {days.map((day) => (<TabsTrigger key={day} value={day} className="text-xs rounded-md text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"><span className="font-medium">{getShortDayName(day)}</span></TabsTrigger>))}
          </TabsList>
          {days.map((day) => (
            <TabsContent key={day} value={day} className="space-y-3">
              {scheduleData[day]?.filter(l => !l.isSkipped).length > 0 ? (
                scheduleData[day].map((lesson) => !lesson.isSkipped && (
                  <Card key={lesson.id} className="bg-[#2D2D3A] border-gray-700/50 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white">{lesson.subject}</span>
                        <span className="text-xs font-mono text-gray-400">{lesson.customTime ? `${lesson.startTime}–${lesson.endTime}`: getTimeBySlot(lesson.slot)}</span>
                      </div>
                      <div className="font-medium flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">{lesson.slot}-я пара</span>
                        {getLessonTypeBadge(lesson.lessonType)}
                      </div>
                      <div className="mt-3 flex flex-col gap-2 text-sm text-gray-300">
                        {lesson.teacher && <div className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500" />{lesson.teacher}</div>}
                        {lesson.room && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" />{lesson.room}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-[#2D2D3A] rounded-xl border border-dashed border-gray-700/50">
                  <Clock className="h-10 w-10 mx-auto mb-4 text-gray-600" /><p className="text-gray-400">На этот день занятий нет</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-[#2D2D3A]">
          {viewLayout === 'subject' ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-[#3a3a4a]/50">
                <tr>
                  <th className="p-4 font-semibold text-white w-[8%]">День</th>
                  {slots.map(slot => <th key={slot} className="p-4 font-semibold text-white text-center">{slot}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {days.map(day => (
                  <tr key={day} className="hover:bg-[#3a3a4a]/40 transition-colors">
                    <td className="p-4 font-semibold text-white align-top">{day}</td>
                    {slots.map(slot => {
                      const lesson = scheduleData[day]?.find(l => l.slot === slot && !l.isSkipped);
                      return (
                        <td key={`${day}-${slot}`} className="p-3 text-center align-middle">
                          {lesson ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="font-semibold text-white text-sm">{lesson.subject}</div>
                              {getLessonTypeBadge(lesson.lessonType)}
                              <div className="mt-1 space-y-1 text-xs text-gray-400">
                                {lesson.teacher && (
                                  <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 flex-shrink-0" /><span>{lesson.teacher}</span></div>
                                )}
                                {lesson.room && (
                                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span>{lesson.room}</span></div>
                                )}
                              </div>
                            </div>
                          ) : (
                            null
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-[#3a3a4a]/50">
                <tr>
                  <th className="p-4 font-semibold text-white w-[5%]">№</th>
                  <th className="p-4 font-semibold text-white w-[15%]">Время</th>
                  {days.map(day => <th key={day} className="p-4 font-semibold text-white text-center">{day}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {slots.map(slot => (
                  <tr key={slot} className="hover:bg-[#3a3a4a]/40 transition-colors">
                    <td className="p-4 font-semibold text-white text-center align-middle">{slot}</td>
                    <td className="p-4 font-mono text-blue-400 align-middle">{getTimeBySlot(slot)}</td>
                    {days.map(day => {
                       const lesson = scheduleData[day]?.find(l => l.slot === slot && !l.isSkipped);
                       return (
                        <td key={`${day}-${slot}`} className="p-3 text-center align-middle">
                          {lesson ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="font-semibold text-white text-sm">{lesson.subject}</div>
                              {getLessonTypeBadge(lesson.lessonType)}
                              <div className="mt-1 space-y-1 text-xs text-gray-400">
                                {lesson.teacher && (
                                  <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 flex-shrink-0" /><span>{lesson.teacher}</span></div>
                                )}
                                {lesson.room && (
                                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span>{lesson.room}</span></div>
                                )}
                              </div>
                            </div>
                          ) : (
                            null
                          )}
                        </td>
                       )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
