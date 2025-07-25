"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChevronDown, ChevronUp, Clock, Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface Announcement {
  id: string
  title: string
  content: string
  startDate: Date
  endDate?: Date
  isPublished: boolean
  priority: "urgent" | "high" | "normal"
}

interface AdminAnnouncementsProps {
  announcements?: Announcement[]
  onCreateAnnouncement?: () => void
  onEditAnnouncement?: (announcement: Announcement) => void
  onDeleteAnnouncement?: (announcementId: string) => void
  onTogglePublish?: (announcement: Announcement) => void
}

const formatDate = (date: Date | string) => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return "Неверная дата"
    }
    return dateObj.toLocaleDateString("ru-RU")
  } catch (error) {
    return "Неверная дата"
  }
}

const getPriorityBadge = (priority: string) => {
  if (!priority) return null

  if (priority === "urgent") {
    return (
      <Badge variant="destructive" className="bg-red-500 text-white dark:bg-red-600">
        Срочно
      </Badge>
    )
  }
  if (priority === "high") {
    return (
      <Badge variant="secondary" className="bg-amber-500 text-white dark:bg-amber-600">
        Важно
      </Badge>
    )
  }
  return null
}

export function AdminAnnouncements({
  announcements = [],
  onCreateAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onTogglePublish,
}: AdminAnnouncementsProps) {
  const [collapsedAnnouncements, setCollapsedAnnouncements] = useState<{
    [key: string]: boolean
  }>({})

  const toggleCollapse = (id: string) => {
    setCollapsedAnnouncements((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }))
  }

  const handleCreateAnnouncement = () => {
    if (onCreateAnnouncement) {
      onCreateAnnouncement()
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    if (onEditAnnouncement) {
      onEditAnnouncement(announcement)
    }
  }

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (onDeleteAnnouncement) {
      onDeleteAnnouncement(announcementId)
    }
  }

  const handleTogglePublish = (announcement: Announcement) => {
    if (onTogglePublish) {
      onTogglePublish(announcement)
    }
  }

  if (!announcements) {
    return <div>Загрузка...</div>
  }

  return (
    <div>
      {/* 2. Улучшим отображение заголовка и кнопки создания объявления */}
      {/* Заменим div с классом "flex justify-between items-center" на более адаптивный */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Управление объявлениями</h2>
        <Button onClick={handleCreateAnnouncement}>
          <Plus className="mr-2 h-4 w-4" /> Создать объявление
        </Button>
      </div>

      {announcements?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Объявления не найдены</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            // Улучшение адаптивности компонента AdminAnnouncements

            // 1. Улучшим отображение карточек объявлений на мобильных устройствах
            // Заменим стиль карточки объявления на более адаптивный
            <Card
              key={announcement.id}
              className={`overflow-hidden transition-all hover:shadow-md ${!announcement.isPublished ? "border-gray-300 bg-gray-50 dark:bg-gray-900/20" : announcement.priority === "urgent" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : announcement.priority === "high" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex flex-wrap items-center gap-2">
                      {announcement.title}
                      {!announcement.isPublished && (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Скрыто
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
                    {announcement?.priority && getPriorityBadge(announcement.priority)}
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
                <>
                  <CardContent className="pt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={announcement.content} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleTogglePublish(announcement)}>
                      {announcement.isPublished ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" /> Скрыть
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" /> Опубликовать
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                      <Edit className="mr-2 h-4 w-4" /> Редактировать
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Объявление будет удалено навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
