"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Button } from "@/components/ui/button"
import { ImageGallery } from "@/components/image-gallery"
import { Calendar, Clock, ImageIcon, Share2, Download, Printer, BookOpen } from "lucide-react"
import { toast } from "sonner"

type Week = {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

type Note = {
  id: number
  subject: string
  title: string
  content: string
  scheduleId: number | null
  weekId: number | null
  createdAt: string
  updatedAt: string
  images: {
    id: number
    filename: string
    imageUrl: string
  }[]
  schedule?: {
    id: number
    subject: string
    day: string
    slot: number
  } | null
  week?: Week | null
}

type NoteViewProps = {
  note: Note
}

export function NoteView({ note }: NoteViewProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Открытие галереи для конкретного изображения
  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  // Поделиться конспектом
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${note.subject} - ${note.title}`,
          text: `Конспект по предмету "${note.subject}": ${note.title}`,
          url: window.location.href,
        })
      } else if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        // Проверяем доступность clipboard API
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Ссылка скопирована в буфер обмена")
      } else {
        // Запасной вариант, если clipboard API недоступен
        const textArea = document.createElement("textarea")
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          toast.success("Ссылка скопирована в буфер обмена")
        } catch (err) {
          toast.error("Не удалось скопировать ссылку")
        }

        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error("Ошибка при попытке поделиться:", error)
      toast.error("Не удалось поделиться ссылкой")
    }
  }

  // Печать конспекта
  const handlePrint = () => {
    window.print()
  }

  // Экспорт конспекта в Markdown
  const handleExport = () => {
    try {
      const markdownContent = `# ${note.title}\n\n**Предмет:** ${note.subject}\n\n${note.content}`
      const blob = new Blob([markdownContent], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${note.subject} - ${note.title}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Ошибка при экспорте:", error)
      toast.error("Не удалось экспортировать конспект")
    }
  }

  return (
    <>
      <Card className="shadow-sm print:shadow-none">
        <CardHeader className="pb-3 print:pb-2">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl print:text-xl">{note.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-medium">{note.subject}</span>
                {note.week && (
                  <Badge variant="outline" className="print:hidden">
                    {note.week.name}
                  </Badge>
                )}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Обновлено: {formatDate(note.updatedAt)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Создано: {formatDate(note.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              {note.images && note.images.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => openGallery(0)}>
                  <ImageIcon className="h-4 w-4 mr-1" /> Галерея ({note.images.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" /> Поделиться
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" /> Экспорт
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Печать
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 print:pt-0">
          {note.images && note.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6 print:hidden">
              {note.images.map((image, index) => (
                <div
                  key={image.id}
                  className="border rounded-md overflow-hidden h-32 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openGallery(index)}
                >
                  <img
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    title={image.filename}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Для печати - отображаем первое изображение */}
          {note.images && note.images.length > 0 && (
            <div className="hidden print:block mb-4">
              <img
                src={note.images[0].imageUrl || "/placeholder.svg"}
                alt={note.images[0].filename}
                className="max-h-40 object-contain"
              />
            </div>
          )}

          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert print:text-sm">
            {note.content ? (
              <MarkdownRenderer content={note.content} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4" />
                <p>Содержимое конспекта отсутствует</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Галерея изображений */}
      {note.images && note.images.length > 0 && (
        <ImageGallery
          images={note.images}
          initialIndex={galleryIndex}
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
        />
      )}
    </>
  )
}
