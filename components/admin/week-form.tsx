"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Save, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WeekFormProps {
  weekId?: number
  onSuccess: () => void
}

export function WeekForm({ weekId, onSuccess }: WeekFormProps) {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(!!weekId)
  const { toast } = useToast()

  // Если есть weekId, загружаем данные недели
  useEffect(() => {
    if (weekId) {
      const fetchWeek = async () => {
        try {
          setIsLoadingData(true)
          const response = await fetch(`/api/weeks/${weekId}`)
          if (!response.ok) {
            throw new Error("Ошибка при загрузке недели")
          }
          const data = await response.json()
          setName(data.name)
          setStartDate(new Date(data.startDate).toISOString().split("T")[0])
          setEndDate(new Date(data.endDate).toISOString().split("T")[0])
        } catch (error) {
          console.error("Error fetching week:", error)
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные недели",
            variant: "destructive",
          })
        } finally {
          setIsLoadingData(false)
        }
      }
      fetchWeek()
    }
  }, [weekId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !startDate || !endDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: "Ошибка",
        description: "Дата окончания не может быть раньше даты начала",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = weekId ? `/api/weeks/${weekId}` : "/api/weeks"
      const method = weekId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Ошибка при сохранении недели")
      }

      toast({
        title: "Успешно",
        description: weekId ? "Неделя обновлена" : "Неделя создана",
      })

      // Сбросить форму
      setName("")
      setStartDate("")
      setEndDate("")

      // Вызвать колбэк успеха
      onSuccess()
    } catch (error) {
      console.error("Error saving week:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить неделю",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-secondary/50 rounded-md"></div>
          <div className="h-10 w-full bg-secondary/30 rounded-lg"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-secondary/50 rounded-md"></div>
            <div className="h-10 w-full bg-secondary/30 rounded-lg"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-secondary/50 rounded-md"></div>
            <div className="h-10 w-full bg-secondary/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <Label htmlFor="week-name" className="form-label flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Название недели
        </Label>
        <Input
          id="week-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Неделя 3"
          className="border-border/60 bg-background/30 backdrop-blur-sm"
          required
        />
        <p className="form-hint">Укажите название, которое будет отображаться в расписании</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-group">
          <Label htmlFor="start-date" className="form-label flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Дата начала
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-border/60 bg-background/30 backdrop-blur-sm"
            required
          />
        </div>
        <div className="form-group">
          <Label htmlFor="end-date" className="form-label flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Дата окончания
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-border/60 bg-background/30 backdrop-blur-sm"
            required
          />
        </div>
      </div>

      {startDate && endDate && new Date(endDate) < new Date(startDate) && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Дата окончания не может быть раньше даты начала</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="gradient" className="gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {weekId ? "Обновить" : "Создать"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
