"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Globe, Upload, AlertTriangle, Check, Info, Calendar, ArrowRight, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

interface ScheduleItem {
  date: string
  dayOfWeek: string
  startTime: string
  endTime: string
  subject: string
  lessonType: string
  room: string
  teacher: string
}

interface Week {
  name: string
  startDate: Date
  endDate: Date
  items: ScheduleItem[]
}

interface ImportFromWebsiteProps {
  onSuccess: () => void
}

export function ImportFromWebsite({ onSuccess }: ImportFromWebsiteProps) {
  const [url, setUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [step, setStep] = useState<"input" | "preview" | "result">("input")
  const [parsedData, setParsedData] = useState<ScheduleItem[]>([])
  const [weeks, setWeeks] = useState<Week[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string; importedCount: number } | null>(null)
  const { toast } = useToast()

  const handleParse = async () => {
    if (!url) {
      toast({
        title: "Ошибка",
        description: "Укажите URL страницы с расписанием",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/schedule/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при парсинге расписания")
      }

      if (!data.items || data.items.length === 0) {
        toast({
          title: "Предупреждение",
          description: "Не удалось найти расписание на странице",
          variant: "warning",
        })
        setIsLoading(false)
        return
      }

      // Исправляем год в датах (если год больше 2100, считаем это ошибкой)
      const correctedItems = data.items.map((item: ScheduleItem) => {
        if (item.date) {
          const [day, month, year] = item.date.split(".").map(Number)
          if (year > 2100) {
            // Заменяем на текущий год
            const currentYear = new Date().getFullYear()
            item.date = `${day.toString().padStart(2, "0")}.${month.toString().padStart(2, "0")}.${currentYear}`
          }
        }
        return item
      })

      setParsedData(correctedItems)

      // Группируем по датам и создаем недели
      const itemsByDate: Record<string, ScheduleItem[]> = {}
      correctedItems.forEach((item: ScheduleItem) => {
        if (!itemsByDate[item.date]) {
          itemsByDate[item.date] = []
        }
        itemsByDate[item.date].push(item)
      })

      const generatedWeeks: Week[] = []
      const processedDates = new Set<string>()

      // Для каждой даты создаем неделю
      Object.keys(itemsByDate).forEach((dateStr) => {
        if (processedDates.has(dateStr)) return

        const [day, month, year] = dateStr.split(".").map(Number)
        const date = new Date(year, month - 1, day)

        // Определяем начало недели (понедельник)
        const startDate = new Date(date)
        const dayOfWeek = date.getDay() // 0 - воскресенье, 1 - понедельник, и т.д.
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate.setDate(startDate.getDate() - daysFromMonday)

        // Определяем конец недели (воскресенье)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)

        // Собираем все занятия для этой недели
        const weekItems: ScheduleItem[] = []

        // Проверяем все даты в диапазоне недели
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateKey = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${d.getFullYear()}`

          if (itemsByDate[dateKey]) {
            weekItems.push(...itemsByDate[dateKey])
            processedDates.add(dateKey)
          }
        }

        if (weekItems.length > 0) {
          generatedWeeks.push({
            name: `Неделя ${format(startDate, "dd.MM.yyyy")} - ${format(endDate, "dd.MM.yyyy")}`,
            startDate,
            endDate,
            items: weekItems,
          })
        }
      })

      setWeeks(generatedWeeks)
      setStep("preview")
      toast({
        title: "Успешно",
        description: `Найдено ${correctedItems.length} занятий в расписании`,
      })
    } catch (error) {
      console.error("Error parsing schedule:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось распарсить расписание",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (weeks.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нет данных для импорта",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setResult(null)

    try {
      const response = await fetch("/api/schedule/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weeks }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при импорте расписания")
      }

      setResult({
        success: data.success,
        message: data.message || "Расписание успешно импортировано",
        importedCount: data.summary?.importedItemsCount || 0,
      })

      if (data.success) {
        toast({
          title: "Успешно",
          description: `Импортировано ${data.summary?.importedItemsCount || 0} записей расписания`,
        })
        setStep("result")
        onSuccess()
      } else {
        toast({
          title: "Предупреждение",
          description: data.message || "Возникли проблемы при импорте",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error importing schedule:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось импортировать расписание",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleWeekNameChange = (index: number, name: string) => {
    const updatedWeeks = [...weeks]
    updatedWeeks[index].name = name
    setWeeks(updatedWeeks)
  }

  const handleWeekDateChange = (index: number, type: "start" | "end", date: Date) => {
    const updatedWeeks = [...weeks]
    if (type === "start") {
      updatedWeeks[index].startDate = date
    } else {
      updatedWeeks[index].endDate = date
    }
    setWeeks(updatedWeeks)
  }

  const handleReset = () => {
    setStep("input")
    setParsedData([])
    setWeeks([])
    setResult(null)
  }

  return (
    <Card className="border-border/30 bg-card shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              Импорт расписания с сайта колледжа
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === "input"
                ? "Укажите URL страницы с расписанием для автоматического импорта"
                : step === "preview"
                  ? "Проверьте и отредактируйте данные перед импортом"
                  : "Результат импорта расписания"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === "input" && (
          <>
            <Alert className="mb-4 border-primary/20 bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Импорт расписания с сайта</AlertTitle>
              <AlertDescription>
                Система автоматически проанализирует страницу расписания и импортирует данные. Для корректной работы
                необходимо указать точный URL страницы с расписанием группы.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL страницы с расписанием</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://mti.moscow/studentu?schedule-type=students&schedule-id=29826"
                  className="border-border/30 bg-background/30 backdrop-blur-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Например: https://mti.moscow/studentu?schedule-type=students&schedule-id=29826
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleParse} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Загрузить расписание
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "preview" && (
          <>
            <Alert className="mb-4 border-green-500/20 bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Расписание успешно загружено</AlertTitle>
              <AlertDescription>
                Найдено {parsedData.length} занятий в расписании. Проверьте данные и внесите необходимые изменения перед
                импортом.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="weeks" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="weeks">
                  <Calendar className="h-4 w-4 mr-2" />
                  Недели ({weeks.length})
                </TabsTrigger>
                <TabsTrigger value="items">
                  <Calendar className="h-4 w-4 mr-2" />
                  Занятия ({parsedData.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weeks" className="space-y-4">
                {weeks.map((week, index) => (
                  <Card key={index} className="border-border/30">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1">
                          <Input
                            value={week.name}
                            onChange={(e) => handleWeekNameChange(index, e.target.value)}
                            className="font-medium"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`start-date-${index}`} className="whitespace-nowrap">
                              Начало:
                            </Label>
                            <DatePicker
                              id={`start-date-${index}`}
                              date={week.startDate}
                              onSelect={(date) => date && handleWeekDateChange(index, "start", date)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`end-date-${index}`} className="whitespace-nowrap">
                              Конец:
                            </Label>
                            <DatePicker
                              id={`end-date-${index}`}
                              date={week.endDate}
                              onSelect={(date) => date && handleWeekDateChange(index, "end", date)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge className="mb-2">
                        {week.items.length} {week.items.length === 1 ? "занятие" : "занятий"}
                      </Badge>
                      <ScrollArea className="h-[200px] rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Дата</TableHead>
                              <TableHead>День</TableHead>
                              <TableHead>Время</TableHead>
                              <TableHead>Предмет</TableHead>
                              <TableHead>Тип</TableHead>
                              <TableHead>Аудитория</TableHead>
                              <TableHead>Преподаватель</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {week.items.map((item, itemIndex) => (
                              <TableRow key={itemIndex}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.dayOfWeek}</TableCell>
                                <TableCell>
                                  {item.startTime}-{item.endTime}
                                </TableCell>
                                <TableCell>{item.subject}</TableCell>
                                <TableCell>{item.lessonType}</TableCell>
                                <TableCell>{item.room}</TableCell>
                                <TableCell>{item.teacher}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="items">
                <ScrollArea className="h-[400px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>День</TableHead>
                        <TableHead>Время</TableHead>
                        <TableHead>Предмет</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Аудитория</TableHead>
                        <TableHead>Преподаватель</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.dayOfWeek}</TableCell>
                          <TableCell>
                            {item.startTime}-{item.endTime}
                          </TableCell>
                          <TableCell>{item.subject}</TableCell>
                          <TableCell>{item.lessonType}</TableCell>
                          <TableCell>{item.room}</TableCell>
                          <TableCell>{item.teacher}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleReset}>
                Назад
              </Button>
              <Button onClick={handleImport} disabled={isImporting} className="bg-primary hover:bg-primary/90">
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Импортировать расписание
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === "result" && result && (
          <>
            <Alert
              className={`mb-4 ${
                result.success ? "border-green-500/20 bg-green-500/10" : "border-yellow-500/20 bg-yellow-500/10"
              }`}
            >
              {result.success ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <AlertTitle>{result.success ? "Успешно импортировано" : "Результат импорта"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.success && result.importedCount > 0 && (
                  <Badge className="ml-2 bg-green-500/20 text-green-500 border-green-500/20">
                    {result.importedCount} записей
                  </Badge>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleReset}>
                Импортировать еще
              </Button>
              <Button onClick={onSuccess} className="bg-primary hover:bg-primary/90">
                <ArrowRight className="mr-2 h-4 w-4" />
                Перейти к расписанию
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
