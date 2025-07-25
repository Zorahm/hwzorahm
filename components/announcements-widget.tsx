"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BellRing, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { formatDate } from "@/lib/client-utils"
import Link from "next/link"

interface Announcement {
  id: number
  title: string
  content: string
  priority: string
  isPublished: boolean
  startDate: string
  endDate: string | null
  createdAt: string
}

export function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsedAnnouncements, setCollapsedAnnouncements] = useState<Record<number, boolean>>({})

  // Загрузка состояния свернутых объявлений из localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("collapsedAnnouncements")
      if (savedState) {
        setCollapsedAnnouncements(JSON.parse(savedState))
      }
    } catch (error) {
      console.error("Ошибка при загрузке состояния объявлений:", error)
    }
  }, [])

  // Сохранение состояния свернутых объявлений в localStorage
  useEffect(() => {
    try {
      localStorage.setItem("collapsedAnnouncements", JSON.stringify(collapsedAnnouncements))
    } catch (error) {
      console.error("Ошибка при сохранении состояния объявлений:", error)
    }
  }, [collapsedAnnouncements])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/announcements?published=true&active=true")

        if (!res.ok) {
          throw new Error("Failed to fetch announcements")
        }

        const data = await res.json()
        // Показываем только 3 самых важных объявления
        setAnnouncements(data.slice(0, 3))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Получение цвета бейджа в зависимости от приоритета
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Низкий</Badge>
      case "normal":
        return <Badge variant="secondary">Обычный</Badge>
      case "high":
        return <Badge variant="default">Важный</Badge>
      case "urgent":
        return <Badge variant="destructive">Срочный</Badge>
      default:
        return <Badge variant="secondary">Обычный</Badge>
    }
  }

  // Сокращение контента для виджета
  const truncateContent = (content: string) => {
    if (content.length <= 100) return content
    return content.substring(0, 100) + "..."
  }

  // Переключение состояния свернутости объявления
  const toggleCollapse = (id: number) => {
    setCollapsedAnnouncements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BellRing className="h-4 w-4 mr-2" />
            Объявления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BellRing className="h-4 w-4 mr-2" />
            Объявления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">Нет активных объявлений</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <BellRing className="h-4 w-4 mr-2" />
            Объявления
          </div>
          <Link href="/announcements" passHref>
            <Button variant="ghost" size="sm" className="h-7 gap-1">
              Все <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-3 rounded-md border ${
                announcement.priority === "urgent"
                  ? "bg-red-50 dark:bg-red-950/10 border-red-100 dark:border-red-900/20"
                  : announcement.priority === "high"
                    ? "bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20"
                    : "bg-secondary/50 border-border/30"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(announcement.priority)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCollapse(announcement.id)}
                    className="h-6 w-6 p-0"
                  >
                    {collapsedAnnouncements[announcement.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{formatDate(announcement.startDate)}</div>
              {!collapsedAnnouncements[announcement.id] && (
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={truncateContent(announcement.content)} />
                </div>
              )}
              <div className="mt-2">
                <Link href={`/announcements#announcement-${announcement.id}`} passHref>
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    Подробнее
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
