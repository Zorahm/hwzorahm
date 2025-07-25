"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduleView } from "@/components/schedule-view"
import { HomeworkList } from "@/components/homework-list"
import { ExamsList } from "@/components/exams-list"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ChevronDown, Clock, Archive, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Week {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

export default function ArchivePage() {
  const [pastWeeks, setPastWeeks] = useState<Week[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("schedule")
  const [nextArchiveWeek, setNextArchiveWeek] = useState<Week | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/weeks")
        if (!response.ok) {
          throw new Error("Ошибка при загрузке недель")
        }
        const data = await response.json()

        // Фильтруем только прошедшие недели и сортируем по дате (от новых к старым)
        const past = data
          .filter((week: Week) => week.status === "past")
          .sort((a: Week, b: Week) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())

        setPastWeeks(past)

        // Выбираем самую недавнюю прошедшую неделю по умолчанию
        if (past.length > 0) {
          setSelectedWeek(past[0])
        }

        // Находим текущую неделю
        const currentWeek = data.find((week: Week) => week.status === "current")

        // Исправлено: показываем текущую неделю как следующую для архивации
        if (currentWeek) {
          setNextArchiveWeek(currentWeek)
        }
      } catch (error) {
        console.error("Error fetching past weeks:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить архив недель",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeks()
  }, [toast])

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("ru-RU")} - ${end.toLocaleDateString("ru-RU")}`
  }

  const handleSelectWeek = (week: Week) => {
    setSelectedWeek(week)
  }

  const getDaysUntilArchive = (week: Week) => {
    if (!week) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(week.endDate)
    endDate.setHours(23, 59, 59, 999)

    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin-slow rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Загрузка архива...</p>
        </div>
      </div>
    )
  }

  if (pastWeeks.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
            <Archive className="h-5 w-5 text-white" />
          </div>
          <span>Архив</span>
        </h1>

        {nextArchiveWeek && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Информация об архивации</AlertTitle>
            <AlertDescription>
              В архиве пока нет прошедших недель. Неделя "{nextArchiveWeek.name}" (
              {formatDateRange(nextArchiveWeek.startDate, nextArchiveWeek.endDate)}) будет архивирована после её
              завершения.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/40 bg-card/95 backdrop-blur-sm shadow-md">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Archive className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-muted-foreground text-lg">В архиве пока нет прошедших недель</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
            <Archive className="h-5 w-5 text-white" />
          </div>
          <span>Архив</span>
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-border/40 bg-card/80 backdrop-blur-sm shadow-sm"
            >
              <Calendar className="h-4 w-4 text-primary" />
              {selectedWeek
                ? `${selectedWeek.name} (${formatDateRange(selectedWeek.startDate, selectedWeek.endDate)})`
                : "Выберите неделю"}
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px] border-border/40 bg-card/95 backdrop-blur-sm">
            {pastWeeks.map((week) => (
              <DropdownMenuItem
                key={week.id}
                onClick={() => handleSelectWeek(week)}
                className={selectedWeek?.id === week.id ? "bg-secondary text-primary" : ""}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-gray-500 flex-shrink-0" />
                  <span>
                    {week.name} ({formatDateRange(week.startDate, week.endDate)})
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {nextArchiveWeek && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-200">
          <Info className="h-5 w-5" />
          <AlertTitle>Следующая архивация</AlertTitle>
          <AlertDescription className="flex flex-col gap-1">
            <div>
              Неделя "{nextArchiveWeek.name}" ({formatDateRange(nextArchiveWeek.startDate, nextArchiveWeek.endDate)})
              будет архивирована после её завершения.
            </div>
            {getDaysUntilArchive(nextArchiveWeek) !== null && (
              <Badge
                variant="outline"
                className="w-fit mt-1 bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
              >
                Осталось дней: {getDaysUntilArchive(nextArchiveWeek)}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {selectedWeek && (
        <Card className="border-border/40 bg-card/95 backdrop-blur-sm hover-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span>Архивные данные</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {selectedWeek.name} ({formatDateRange(selectedWeek.startDate, selectedWeek.endDate)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/50 border border-border/40 p-1 rounded-lg">
                <TabsTrigger
                  value="schedule"
                  className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Расписание
                </TabsTrigger>
                <TabsTrigger
                  value="homework"
                  className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Домашние задания
                </TabsTrigger>
                <TabsTrigger
                  value="exams"
                  className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Экзамены
                </TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="space-y-4 fade-in">
                <ScheduleView weekId={selectedWeek.id} />
              </TabsContent>

              <TabsContent value="homework" className="space-y-4 fade-in">
                <HomeworkList weekId={selectedWeek.id} />
              </TabsContent>

              <TabsContent value="exams" className="space-y-4 fade-in">
                <ExamsList weekId={selectedWeek.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
