"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellRing, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { formatDate } from "@/lib/client-utils"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"

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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [collapsedAnnouncements, setCollapsedAnnouncements] = useState<Record<number, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 5

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
        const res = await fetch(
          `/api/announcements?published=true&page=${currentPage}&limit=${itemsPerPage}&priority=${activeTab === "all" ? "" : activeTab}`,
        )

        if (!res.ok) {
          throw new Error("Failed to fetch announcements")
        }

        const data = await res.json()

        // Если API поддерживает пагинацию и возвращает метаданные
        if (data.items && data.meta) {
          setAnnouncements(data.items)
          setTotalPages(data.meta.totalPages)
          setTotalItems(data.meta.totalItems)
        } else {
          // Если API не поддерживает пагинацию, делаем ее на клиенте
          setAnnouncements(data)
          setTotalItems(data.length)
          setTotalPages(Math.ceil(data.length / itemsPerPage))
        }
      } catch (err) {
        setError("Не удалось загрузить объявления. Пожалуйста, попробуйте позже.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [activeTab, currentPage])

  // Фильтрация объявлений по приоритету
  const filteredAnnouncements = announcements

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

  // Проверка, является ли объявление новым (создано в течение последних 24 часов)
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffHours = diffTime / (1000 * 60 * 60)
    return diffHours < 24
  }

  const toggleCollapse = (id: number) => {
    setCollapsedAnnouncements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <BellRing className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Объявления</CardTitle>
              <CardDescription className="text-sm">Важная информация и уведомления для студентов</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50 rounded-md p-1">
              <TabsTrigger value="all" className="rounded-md">
                Все
              </TabsTrigger>
              <TabsTrigger value="urgent" className="rounded-md">
                Срочные
              </TabsTrigger>
              <TabsTrigger value="high" className="rounded-md">
                Важные
              </TabsTrigger>
              <TabsTrigger value="normal" className="rounded-md">
                Обычные
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Нет объявлений для отображения</div>
              ) : (
                <div className="space-y-6">
                  {filteredAnnouncements.map((announcement) => (
                    <Card
                      key={announcement.id}
                      id={`announcement-${announcement.id}`}
                      className={`border-border/30 ${
                        announcement.priority === "urgent"
                          ? "border-l-2 border-l-red-400"
                          : announcement.priority === "high"
                            ? "border-l-2 border-l-amber-400"
                            : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {announcement.title}
                              {isNew(announcement.createdAt) && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30"
                                >
                                  Новое
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {formatDate(announcement.startDate)}
                              </div>
                              {announcement.endDate && (
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  до {formatDate(announcement.endDate)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(announcement.priority)}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleCollapse(announcement.id)}
                              className="h-8 w-8"
                            >
                              {collapsedAnnouncements[announcement.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {!collapsedAnnouncements[announcement.id] && (
                        <CardContent className="pt-0">
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={announcement.content} />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
