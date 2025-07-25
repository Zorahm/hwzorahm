"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeekForm } from "@/components/admin/week-form"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Plus, Trash2, Calendar, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Week {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

export function AdminWeeks() {
  const [weeks, setWeeks] = useState<Week[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWeekId, setEditingWeekId] = useState<number | null>(null)
  const { toast } = useToast()

  // Загрузка списка недель
  const fetchWeeks = async () => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeks()
  }, [toast])

  // Обработчик удаления недели
  const handleDeleteWeek = async (weekId: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту неделю? Это действие нельзя отменить.")) {
      return
    }

    try {
      const response = await fetch(`/api/weeks/${weekId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Ошибка при удалении недели")
      }

      toast({
        title: "Успешно",
        description: "Неделя удалена",
      })

      // Обновить список недель
      fetchWeeks()
    } catch (error) {
      console.error("Error deleting week:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить неделю",
        variant: "destructive",
      })
    }
  }

  // Обработчик успешного сохранения недели
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingWeekId(null)
    fetchWeeks()
  }

  // Обработчик редактирования недели
  const handleEditWeek = (weekId: number) => {
    setEditingWeekId(weekId)
    setShowForm(true)
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Управление неделями
        </h2>
        <p className="text-muted-foreground">
          Создавайте и редактируйте учебные недели для организации расписания и домашних заданий
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingWeekId(null)
            setShowForm(!showForm)
          }}
          variant={showForm ? "outline" : "gradient"}
          className="gap-2"
        >
          {showForm ? "Отменить" : "Добавить неделю"}
          {!showForm && <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {showForm && (
        <Card className="admin-card border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {editingWeekId ? "Редактировать неделю" : "Добавить неделю"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <WeekForm weekId={editingWeekId || undefined} onSuccess={handleFormSuccess} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="admin-card shimmer">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 bg-secondary/50 rounded-md mb-3"></div>
                <div className="h-4 w-1/2 bg-secondary/30 rounded-md"></div>
              </CardContent>
            </Card>
          ))
        ) : weeks.length > 0 ? (
          weeks.map((week) => (
            <Card key={week.id} className="admin-card hover-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {week.name}
                  </h3>
                  {week.status === "current" && (
                    <Badge variant="soft" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Текущая
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {formatDate(week.startDate)} - {formatDate(week.endDate)}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="soft" size="sm" onClick={() => handleEditWeek(week.id)} className="h-8 gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWeek(week.id)}
                    className="h-8 gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">Нет доступных недель</h3>
            <p className="text-muted-foreground mb-4">Создайте первую учебную неделю, чтобы начать работу</p>
            <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить неделю
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
