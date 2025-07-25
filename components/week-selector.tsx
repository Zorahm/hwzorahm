"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Week {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

interface WeekSelectorProps {
  onWeekChange?: (weekId: number) => void
  initialWeekId?: number
  filter?: "all" | "current" | "future" | "past" | "current-future"
}

export function WeekSelector({ onWeekChange, initialWeekId, filter = "all" }: WeekSelectorProps) {
  const [weeks, setWeeks] = useState<Week[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Добавляем ref для хранения предыдущего значения weekId
  // Добавьте эту строку в начало компонента WeekSelector, после объявления состояний
  const previousWeekIdRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await fetch("/api/weeks")
        if (!response.ok) {
          throw new Error("Ошибка при загрузке недель")
        }
        const data = await response.json()

        // Фильтруем недели в зависимости от параметра filter
        let filteredWeeks = [...data]

        if (filter === "current") {
          filteredWeeks = data.filter((w: Week) => w.status === "current")
        } else if (filter === "future") {
          filteredWeeks = data.filter((w: Week) => w.status === "future")
        } else if (filter === "past") {
          filteredWeeks = data.filter((w: Week) => w.status === "past")
        } else if (filter === "current-future") {
          filteredWeeks = data.filter((w: Week) => w.status === "current" || w.status === "future")
        }

        setWeeks(filteredWeeks)

        // Если указан initialWeekId, выбираем эту неделю
        if (initialWeekId) {
          const week = filteredWeeks.find((w: Week) => w.id === initialWeekId)
          if (week) {
            setSelectedWeek(week)
            return
          }
        }

        // Иначе выбираем текущую неделю или первую в списке
        const currentWeek = filteredWeeks.find((w: Week) => w.status === "current")
        setSelectedWeek(currentWeek || filteredWeeks[0])
      } catch (error) {
        console.error("Error fetching weeks:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список недель",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeks()
  }, [initialWeekId, toast, filter])

  // Исправляем useEffect, чтобы избежать бесконечного цикла
  // Добавляем проверку, чтобы не вызывать onWeekChange, если weekId не изменился
  useEffect(() => {
    if (selectedWeek && onWeekChange) {
      // Добавляем проверку на предыдущее значение, чтобы избежать лишних вызовов
      const weekId = selectedWeek.id
      // Используем ref для хранения предыдущего значения
      if (previousWeekIdRef.current !== weekId) {
        previousWeekIdRef.current = weekId
        onWeekChange(weekId)
      }
    }
  }, [selectedWeek, onWeekChange])

  const handleSelectWeek = (week: Week) => {
    setSelectedWeek(week)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("ru-RU")} - ${end.toLocaleDateString("ru-RU")}`
  }

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 border-white/20 bg-card/50 backdrop-blur-sm rounded-lg"
        disabled
      >
        <Calendar className="h-4 w-4 animate-pulse" />
        <span className="animate-pulse">Загрузка...</span>
      </Button>
    )
  }

  if (weeks.length === 0) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 border-white/20 bg-card/50 backdrop-blur-sm rounded-lg"
        disabled
      >
        <Calendar className="h-4 w-4" />
        Нет доступных недель
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 bg-card/50 backdrop-blur-sm rounded-lg"
        >
          <Calendar className="h-4 w-4 text-primary" />
          {selectedWeek
            ? `${selectedWeek.name} (${formatDateRange(selectedWeek.startDate, selectedWeek.endDate)})`
            : "Выберите неделю"}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] border-white/20 bg-card/95 backdrop-blur-md rounded-lg">
        {weeks.map((week) => (
          <DropdownMenuItem
            key={week.id}
            onClick={() => handleSelectWeek(week)}
            className={cn(
              "transition-colors duration-200 rounded-md",
              selectedWeek?.id === week.id ? "bg-primary/20 text-primary" : "",
              week.status === "current" ? "font-medium" : "",
              week.status === "past" ? "text-muted-foreground" : "",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  week.status === "current" ? "bg-green-500" : week.status === "future" ? "bg-primary" : "bg-gray-500",
                )}
              />
              <span>
                {week.name} ({formatDateRange(week.startDate, week.endDate)})
              </span>
              {week.status === "current" && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">текущая</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
