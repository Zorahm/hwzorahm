"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Week {
  id: number
  name: string
}

interface ScheduleFormProps {
  scheduleId?: number
  weekId?: number
  onSuccess: () => void
}

export function ScheduleForm({ scheduleId, weekId: propWeekId, onSuccess }: ScheduleFormProps) {
  const [weeks, setWeeks] = useState<Week[]>([])
  const [weekId, setWeekId] = useState<string>("")
  const [day, setDay] = useState<string>("")
  const [slot, setSlot] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [teacher, setTeacher] = useState("")
  const [room, setRoom] = useState("")
  const [lessonType, setLessonType] = useState("")
  const [customTime, setCustomTime] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isSkipped, setIsSkipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Обновить массив дней недели с правильными названиями
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]

  // Обновленный массив слотов, включая нулевую и пятую пару
  const slots = [
    { value: "0", label: "0 пара (8:30–10:00)" },
    { value: "1", label: "1 пара (10:10–11:40)" },
    { value: "2", label: "2 пара (11:50–13:20)" },
    { value: "3", label: "3 пара (13:50–15:20)" },
    { value: "4", label: "4 пара (15:30–17:00)" },
    { value: "5", label: "5 пара (17:10–18:40)" },
  ]

  const lessonTypes = [
    { value: "Лекция", label: "Лекция" },
    { value: "Практика", label: "Практика" },
    { value: "Лабораторная", label: "Лабораторная работа" },
    { value: "Консультация", label: "Консультация" },
    { value: "Пересдача", label: "Пересдача" },
    { value: "Экзамен", label: "Экзамен" },
    { value: "Зачет", label: "Зачет" },
  ]

  // Загрузка списка недель
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await fetch("/api/weeks")
        if (!response.ok) {
          throw new Error("Ошибка при загрузке недель")
        }
        const data = await response.json()
        setWeeks(data)
      } catch (error) {
        console.error("Error fetching weeks:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список недель",
          variant: "destructive",
        })
      }
    }
    fetchWeeks()
  }, [toast])

  // Установить weekId из пропса, если он передан
  useEffect(() => {
    if (propWeekId) {
      setWeekId(propWeekId.toString())
    }
  }, [propWeekId])

  // Если есть scheduleId, загружаем данные расписания
  useEffect(() => {
    if (scheduleId) {
      const fetchSchedule = async () => {
        try {
          const response = await fetch(`/api/schedule/${scheduleId}`)
          if (!response.ok) {
            throw new Error("Ошибка при загрузке расписания")
          }
          const data = await response.json()
          setWeekId(data.weekId.toString())
          setDay(data.day)
          setSlot(data.slot.toString())
          setSubject(data.subject)
          setTeacher(data.teacher || "")
          setRoom(data.room || "")
          setLessonType(data.lessonType || "")
          setCustomTime(data.customTime)
          setStartTime(data.startTime || "")
          setEndTime(data.endTime || "")
          setIsSkipped(data.isSkipped)
        } catch (error) {
          console.error("Error fetching schedule:", error)
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные расписания",
            variant: "destructive",
          })
        }
      }
      fetchSchedule()
    }
  }, [scheduleId, toast])

  // Валидация времени в формате HH:MM
  const validateTimeFormat = (time: string): boolean => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
    return regex.test(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submission values:", { weekId, day, slot, subject, teacher, room, lessonType })

    if (
      !weekId ||
      weekId === "" ||
      !day ||
      day === "" ||
      slot === undefined ||
      slot === "" ||
      !subject ||
      subject === ""
    ) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    // Проверяем, что weekId является числом
    if (isNaN(Number(weekId))) {
      toast({
        title: "Ошибка",
        description: "Выберите корректную неделю",
        variant: "destructive",
      })
      return
    }

    if (customTime && (!startTime || !endTime)) {
      toast({
        title: "Ошибка",
        description: "Укажите время начала и окончания пары",
        variant: "destructive",
      })
      return
    }

    // Валидация формата времени
    if (customTime && (!validateTimeFormat(startTime) || !validateTimeFormat(endTime))) {
      toast({
        title: "Ошибка",
        description: "Неверный формат времени. Используйте формат ЧЧ:ММ (например, 08:30)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = scheduleId ? `/api/schedule/${scheduleId}` : "/api/schedule"
      const method = scheduleId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekId: Number.parseInt(weekId),
          day,
          slot: Number.parseInt(slot),
          subject,
          teacher: teacher || null,
          room: room || null,
          lessonType: lessonType || null,
          customTime,
          startTime: customTime ? startTime : null,
          endTime: customTime ? endTime : null,
          isSkipped,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Ошибка при сохранении расписания")
      }

      toast({
        title: "Успешно",
        description: scheduleId ? "Расписание обновлено" : "Расписание создано",
      })

      // Сбросить форму
      if (!scheduleId) {
        setSubject("")
        setTeacher("")
        setRoom("")
        setLessonType("")
        setCustomTime(false)
        setStartTime("")
        setEndTime("")
        setIsSkipped(false)
      }

      // Вызвать колбэк успеха
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="week-id">Неделя</Label>
          <Select value={weekId} onValueChange={setWeekId} required>
            <SelectTrigger className="border-gray-700 bg-[#1A1D2E]">
              <SelectValue placeholder="Выберите неделю" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-[#2A2F45]">
              {weeks.map((week) => (
                <SelectItem key={week.id} value={week.id.toString()}>
                  {week.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day">День недели</Label>
          <Select value={day} onValueChange={setDay} required>
            <SelectTrigger className="border-gray-700 bg-[#1A1D2E]">
              <SelectValue placeholder="Выберите день" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-[#2A2F45]">
              {days.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slot">Номер пары</Label>
          <Select value={slot} onValueChange={setSlot} required>
            <SelectTrigger className="border-gray-700 bg-[#1A1D2E]">
              <SelectValue placeholder="Выберите пару" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-[#2A2F45]">
              {slots.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Предмет</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Название предмета"
          className="border-gray-700 bg-[#1A1D2E]"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="teacher">Преподаватель</Label>
          <Input
            id="teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="ФИО преподавателя"
            className="border-gray-700 bg-[#1A1D2E]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="room">Аудитория</Label>
          <Input
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Номер аудитории"
            className="border-gray-700 bg-[#1A1D2E]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lessonType">Тип занятия</Label>
          <Select value={lessonType} onValueChange={setLessonType}>
            <SelectTrigger className="border-gray-700 bg-[#1A1D2E]">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-[#2A2F45]">
              {lessonTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="custom-time" checked={customTime} onCheckedChange={setCustomTime} />
        <Label htmlFor="custom-time">Указать время</Label>
      </div>

      {customTime && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-time">Начало пары (ЧЧ:ММ)</Label>
            <Input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Начало пары (ЧЧ:ММ)"
              className="border-gray-700 bg-[#1A1D2E]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time">Окончание пары (ЧЧ:ММ)</Label>
            <Input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="Окончание пары (ЧЧ:ММ)"
              className="border-gray-700 bg-[#1A1D2E]"
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox id="is-skipped" checked={isSkipped} onCheckedChange={setIsSkipped} />
        <Label htmlFor="is-skipped">Пропущено</Label>
      </div>

      <Button disabled={isLoading}>{scheduleId ? "Обновить расписание" : "Создать расписание"}</Button>
    </form>
  )
}
