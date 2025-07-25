"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScheduleEditor } from "@/components/admin/schedule-editor"
import { ImportSchedule } from "@/components/admin/import-schedule"
import { useToast } from "@/hooks/use-toast"
import { FileSpreadsheet, Calendar, Upload, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

interface AdminScheduleProps {
  weekId?: number
}

export function AdminSchedule({ weekId }: AdminScheduleProps) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const { toast } = useToast()

  // Загрузка расписания
  const fetchSchedule = async () => {
    if (!weekId) {
      setScheduleItems([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/schedule?weekId=${weekId}`)
      if (!response.ok) {
        throw new Error("Ошибка при загрузке расписания")
      }
      const data = await response.json()
      setScheduleItems(data)
    } catch (error) {
      console.error("Error fetching schedule:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить расписание",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [weekId, toast])

  // Обработчик успешного импорта
  const handleImportSuccess = () => {
    setShowImport(false)
    fetchSchedule()
  }

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Управление расписанием
        </h2>
        <p className="text-muted-foreground">
          {weekId
            ? "Редактируйте расписание для выбранной недели или импортируйте его из Excel"
            : "Выберите неделю для редактирования расписания или импортируйте новое расписание"}
        </p>
      </div>

      {!weekId ? (
        <div className="space-y-6">
          <Card className="admin-card border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Импорт расписания
              </CardTitle>
              <CardDescription>Загрузите расписание из Excel-файла для быстрого создания</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-6">
                <FileSpreadsheet className="h-12 w-12 text-primary/60 mb-4" />
                <h3 className="text-lg font-medium mb-2">Импортировать из Excel</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Загрузите файл Excel с расписанием, чтобы автоматически создать расписание на неделю
                </p>
                <Button
                  onClick={() => setShowImport(!showImport)}
                  variant={showImport ? "outline" : "gradient"}
                  className="gap-2"
                >
                  {showImport ? "Отменить импорт" : "Импортировать расписание"}
                  {!showImport && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>

              {showImport && (
                <div className="mt-6 pt-6 border-t border-border/40">
                  <ImportSchedule onSuccess={handleImportSuccess} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              onClick={() => {
                setShowImport(!showImport)
              }}
              variant={showImport ? "soft" : "outline"}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {showImport ? "Отменить импорт" : "Импортировать из Excel"}
            </Button>
          </div>

          {showImport && (
            <Card className="admin-card border-primary/20 mb-6">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Импорт расписания
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ImportSchedule onSuccess={handleImportSuccess} />
              </CardContent>
            </Card>
          )}

          <ScheduleEditor weekId={weekId} onSuccess={fetchSchedule} />
        </>
      )}
    </div>
  )
}
