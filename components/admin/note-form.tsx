"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  ImageIcon,
  FileText,
  Plus,
  Upload,
  Calculator,
  ActivityIcon as Function,
  Calendar,
  BookMarked,
  Trash2,
  Copy,
  Info,
  HelpCircle,
  Paperclip,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Code,
  Square,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Week = {
  id: number
  name: string
  startDate: string
  endDate: string
  status: string
}

type ScheduleItem = {
  id: number
  weekId: number
  day: string
  slot: number
  subject: string
  teacher?: string
  room?: string
}

type Note = {
  id: number
  subject: string
  title: string
  content: string
  scheduleId: number | null
  weekId: number | null
  images: {
    id: number
    filename: string
    imageUrl: string
  }[]
  schedule?: {
    id: number
    subject: string
  } | null
  week?: Week | null
}

type NoteFormProps = {
  note: Note | null
  onSave: (data: any) => void
  onCancel: () => void
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  const [weeks, setWeeks] = useState<Week[]>([])
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [filteredScheduleItems, setFilteredScheduleItems] = useState<ScheduleItem[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    content: "",
    scheduleId: "",
    weekId: "",
  })
  const [images, setImages] = useState<{ id?: number; filename: string; imageUrl: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const [isLoading, setIsLoading] = useState(true)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Загрузка списка недель
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await fetch("/api/weeks")
        if (!response.ok) {
          throw new Error("Ошибка при загрузке недель")
        }
        const data = await response.json()
        setWeeks(data)

        // Если редактируем существующий конспект, выбираем его неделю
        // Иначе выбираем текущую неделю
        if (note?.weekId) {
          setFormData((prev) => ({ ...prev, weekId: String(note.weekId) }))
        } else {
          const currentWeek = data.find((week: Week) => week.status === "current")
          if (currentWeek) {
            setFormData((prev) => ({ ...prev, weekId: String(currentWeek.id) }))
          } else if (data.length > 0) {
            setFormData((prev) => ({ ...prev, weekId: String(data[0].id) }))
          }
        }
      } catch (error) {
        console.error("Error fetching weeks:", error)
        toast.error("Не удалось загрузить список недель")
      }
    }

    fetchWeeks()
  }, [note?.weekId])

  // Загрузка расписания
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/schedule")
        if (!response.ok) {
          throw new Error("Ошибка при загрузке расписания")
        }
        const data = await response.json()
        setScheduleItems(data)

        // Фильтруем расписание по выбранной неделе
        if (formData.weekId) {
          const filtered = data.filter((item: ScheduleItem) => item.weekId === Number(formData.weekId))
          setFilteredScheduleItems(filtered)

          // Извлекаем уникальные предметы из отфильтрованного расписания
          const uniqueSubjects = Array.from(new Set(filtered.map((item: ScheduleItem) => item.subject)))
          setSubjects(uniqueSubjects as string[])
        }
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast.error("Не удалось загрузить расписание")
      } finally {
        setIsLoading(false)
      }
    }

    if (formData.weekId) {
      fetchSchedule()
    }
  }, [formData.weekId])

  // Заполнение формы данными при редактировании
  useEffect(() => {
    if (note) {
      setFormData({
        subject: note.subject || "",
        title: note.title || "",
        content: note.content || "",
        scheduleId: note.scheduleId ? String(note.scheduleId) : "",
        weekId: note.weekId ? String(note.weekId) : formData.weekId,
      })
      setImages(note.images || [])
    } else {
      setFormData((prev) => ({
        ...prev,
        subject: "",
        title: "",
        content: "",
        scheduleId: "",
      }))
      setImages([])
    }
  }, [note])

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Сохраняем позицию курсора для текстовой области
    if (name === "content" && textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart)
    }
  }

  // Обработчик изменения выпадающего списка
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Если выбрана неделя, фильтруем расписание
    if (name === "weekId") {
      const filtered = scheduleItems.filter((item) => item.weekId === Number(value))
      setFilteredScheduleItems(filtered)

      // Извлекаем уникальные предметы из отфильтрованного расписания
      const uniqueSubjects = Array.from(new Set(filtered.map((item) => item.subject)))
      setSubjects(uniqueSubjects as string[])

      // Сбрасываем выбранный предмет и расписание
      setFormData((prev) => ({ ...prev, subject: "", scheduleId: "" }))
    }

    // Если выбран предмет из расписания, автоматически заполняем поле "Предмет"
    if (name === "scheduleId" && value !== "-1") {
      const selectedSchedule = filteredScheduleItems.find((s) => s.id === Number(value))
      if (selectedSchedule) {
        setFormData((prev) => ({ ...prev, subject: selectedSchedule.subject }))
      }
    }
  }

  // Обработчик выбора предмета
  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }))

    // Находим первый элемент расписания с выбранным предметом
    const scheduleItem = filteredScheduleItems.find((item) => item.subject === value)
    if (scheduleItem) {
      setFormData((prev) => ({ ...prev, scheduleId: String(scheduleItem.id) }))
    } else {
      setFormData((prev) => ({ ...prev, scheduleId: "" }))
    }
  }

  // Обработчик загрузки изображения
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", files[0])

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Ошибка при загрузке файла")
      }

      const data = await response.json()
      const newImage = {
        filename: files[0].name,
        imageUrl: data.fileUrl,
      }

      setImages((prev) => [...prev, newImage])
      toast.success("Изображение успешно загружено")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Не удалось загрузить изображение")
    } finally {
      setIsUploading(false)
      // Сбрасываем input file
      e.target.value = ""
    }
  }

  // Обработчик удаления изображения
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Обработчик сохранения конспекта
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация
    if (!formData.weekId) {
      toast.error("Выберите неделю")
      return
    }
    if (!formData.subject.trim()) {
      toast.error("Укажите предмет")
      return
    }
    if (!formData.title.trim()) {
      toast.error("Укажите название конспекта")
      return
    }

    // Подготовка данных для сохранения
    const noteData = {
      ...formData,
      weekId: Number.parseInt(formData.weekId),
      scheduleId: formData.scheduleId ? Number.parseInt(formData.scheduleId) : null,
      images: images,
    }

    onSave(noteData)
  }

  // Вставка изображения в текст конспекта
  const insertImageToContent = (imageUrl: string) => {
    const imageMarkdown = `![Изображение](${imageUrl})\n\n`

    if (textareaRef.current && cursorPosition !== null) {
      const start = textareaRef.current.value.substring(0, cursorPosition)
      const end = textareaRef.current.value.substring(cursorPosition)

      setFormData((prev) => ({
        ...prev,
        content: start + imageMarkdown + end,
      }))

      // Устанавливаем фокус и позицию курсора после вставки
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newPosition = cursorPosition + imageMarkdown.length
          textareaRef.current.setSelectionRange(newPosition, newPosition)
          setCursorPosition(newPosition)
        }
      }, 0)
    } else {
      setFormData((prev) => ({
        ...prev,
        content: prev.content + imageMarkdown,
      }))
    }

    setActiveTab("edit")
  }

  // Вставка шаблонов LaTeX
  const insertLatexTemplate = (template: string) => {
    if (textareaRef.current && cursorPosition !== null) {
      const start = textareaRef.current.value.substring(0, cursorPosition)
      const end = textareaRef.current.value.substring(cursorPosition)

      setFormData((prev) => ({
        ...prev,
        content: start + template + end,
      }))

      // Устанавливаем фокус и позицию курсора после вставки
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newPosition = cursorPosition + template.length
          textareaRef.current.setSelectionRange(newPosition, newPosition)
          setCursorPosition(newPosition)
        }
      }, 0)
    } else {
      setFormData((prev) => ({
        ...prev,
        content: prev.content + template,
      }))
    }

    setActiveTab("edit")
  }

  // Вставка Markdown разметки
  const insertMarkdown = (before: string, after = "") => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selectedText = formData.content.substring(start, end)

      const newText =
        formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end)

      setFormData((prev) => ({
        ...prev,
        content: newText,
      }))

      // Устанавливаем фокус и выделение после вставки
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newSelectionStart = start + before.length
          const newSelectionEnd = newSelectionStart + selectedText.length
          textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd)
        }
      }, 0)
    }
  }

  // Шаблоны LaTeX
  const latexTemplates = [
    { name: "Формула", icon: Calculator, template: "$$E = mc^2$$" },
    {
      name: "Система уравнений",
      icon: Function,
      template: "$$\\begin{align}\n\\frac{d}{dx}e^x &= e^x \\\\\n\\int e^x dx &= e^x + C\n\\end{align}$$",
    },
    { name: "Матрица", icon: FileText, template: "$$\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}$$" },
    { name: "Дробь", icon: FileText, template: "$$\\frac{a}{b}$$" },
  ]

  // Markdown инструменты
  const markdownTools = [
    { name: "Заголовок 1", icon: Heading1, action: () => insertMarkdown("# ", "\n") },
    { name: "Заголовок 2", icon: Heading2, action: () => insertMarkdown("## ", "\n") },
    { name: "Заголовок 3", icon: Heading3, action: () => insertMarkdown("### ", "\n") },
    { name: "Жирный", icon: Bold, action: () => insertMarkdown("**", "**") },
    { name: "Курсив", icon: Italic, action: () => insertMarkdown("*", "*") },
    { name: "Маркированный список", icon: List, action: () => insertMarkdown("- ", "\n") },
    { name: "Нумерованный список", icon: ListOrdered, action: () => insertMarkdown("1. ", "\n") },
    { name: "Ссылка", icon: Link, action: () => insertMarkdown("[", "](https://example.com)") },
    { name: "Код", icon: Code, action: () => insertMarkdown("`", "`") },
    { name: "Блок кода", icon: Square, action: () => insertMarkdown("```\n", "\n```") },
  ]

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Примеры LaTeX формул для справки
  const latexExamples = {
    formula: "$$E = mc^2$$",
    fraction: "$$\\frac{a}{b}$$",
    squareRoot: "$$\\sqrt{x^2 + y^2}$$",
    sum: "$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$",
    matrix: "$$\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}$$",
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 admin-form">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weekId" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Неделя
            </Label>
            <Select value={formData.weekId} onValueChange={(value) => handleSelectChange("weekId", value)}>
              <SelectTrigger className="border-input">
                <SelectValue placeholder="Выберите неделю" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => (
                  <SelectItem key={week.id} value={String(week.id)}>
                    {week.name} ({formatDate(week.startDate)} - {formatDate(week.endDate)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" /> Предмет
            </Label>
            {isLoading ? (
              <div className="h-10 flex items-center">
                <div className="loader-sm"></div>
                <span className="ml-2 text-sm text-muted-foreground">Загрузка предметов...</span>
              </div>
            ) : subjects.length > 0 ? (
              <Select value={formData.subject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="border-input">
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Введите название предмета"
                required
                className="border-input"
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Название конспекта (тема)</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Введите название конспекта"
            required
            className="border-input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Label>Содержание конспекта (Markdown + LaTeX)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setHelpDialogOpen(true)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Справка по Markdown и LaTeX</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {latexTemplates.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertLatexTemplate(template.template)}
                  title={`Вставить ${template.name.toLowerCase()}`}
                  className="h-8"
                >
                  <template.icon className="h-3.5 w-3.5 mr-1" /> {template.name}
                </Button>
              ))}
            </div>
          </div>

          <Card className="border overflow-hidden">
            <div className="flex items-center gap-1 p-1 bg-muted/50 border-b">
              {markdownTools.map((tool, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" onClick={tool.action} className="h-8 w-8">
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tool.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              <Separator orientation="vertical" className="mx-1 h-6" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.readText().then((text) => {
                            if (textareaRef.current && cursorPosition !== null) {
                              const start = textareaRef.current.value.substring(0, cursorPosition)
                              const end = textareaRef.current.value.substring(cursorPosition)
                              setFormData((prev) => ({
                                ...prev,
                                content: start + text + end,
                              }))
                            }
                          })
                        }
                      }}
                      className="h-8 w-8"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Вставить из буфера обмена</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="edit" className="flex-1">
                  Редактирование
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  Предпросмотр
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="m-0">
                <Textarea
                  id="content"
                  name="content"
                  ref={textareaRef}
                  value={formData.content}
                  onChange={handleChange}
                  onClick={() => {
                    if (textareaRef.current) {
                      setCursorPosition(textareaRef.current.selectionStart)
                    }
                  }}
                  onKeyUp={() => {
                    if (textareaRef.current) {
                      setCursorPosition(textareaRef.current.selectionStart)
                    }
                  }}
                  placeholder="Введите содержание конспекта в формате Markdown + LaTeX"
                  className="min-h-[300px] font-mono border-0 rounded-none resize-y"
                />
              </TabsContent>
              <TabsContent value="preview" className="m-0 p-4 min-h-[300px] overflow-auto border-0">
                {formData.content ? (
                  <MarkdownRenderer content={formData.content} />
                ) : (
                  <div className="text-muted-foreground text-center py-10 flex flex-col items-center">
                    <FileText className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <p>Предпросмотр будет отображен здесь</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Изображения
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative border rounded-md overflow-hidden group h-40">
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => insertImageToContent(image.imageUrl)}
                      className="h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Вставить
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveImage(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`![${image.filename}](${image.imageUrl})`)
                      toast.success("Markdown-код скопирован")
                    }}
                    className="h-8 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" /> Копировать MD
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                  {image.filename}
                </div>
              </div>
            ))}

            <div className="border border-dashed rounded-md flex items-center justify-center p-4 h-40 bg-muted/30 hover:bg-muted/50 transition-colors">
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isUploading ? "Загрузка..." : "Добавить изображение"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          Сохранить
        </Button>
      </div>

      {/* Диалог справки по Markdown и LaTeX */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Справка по Markdown и LaTeX</DialogTitle>
            <DialogDescription>Основные возможности форматирования текста в конспектах</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Основы Markdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Синтаксис</p>
                    <pre className="bg-muted p-2 rounded-md text-xs">
                      # Заголовок 1{"\n"}
                      ## Заголовок 2{"\n"}
                      ### Заголовок 3{"\n\n"}
                      **Жирный текст**{"\n"}
                      *Курсив*{"\n\n"}- Элемент списка{"\n"}- Еще элемент{"\n\n"}
                      1. Нумерованный список{"\n"}
                      2. Второй элемент{"\n\n"}
                      [Текст ссылки](https://example.com){"\n\n"}
                      ![Описание изображения](url-изображения){"\n\n"}
                      `Код`{"\n\n"}
                      \`\`\`{"\n"}Блок кода{"\n"}\`\`\`
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Результат</p>
                    <div className="bg-muted p-2 rounded-md text-xs prose prose-sm max-w-none dark:prose-invert">
                      <h1>Заголовок 1</h1>
                      <h2>Заголовок 2</h2>
                      <h3>Заголовок 3</h3>
                      <p>
                        <strong>Жирный текст</strong>
                      </p>
                      <p>
                        <em>Курсив</em>
                      </p>
                      <ul>
                        <li>Элемент списка</li>
                        <li>Еще элемент</li>
                      </ul>
                      <ol>
                        <li>Нумерованный список</li>
                        <li>Второй элемент</li>
                      </ol>
                      <p>
                        <a href="#">Текст ссылки</a>
                      </p>
                      <p>[Изображение]</p>
                      <p>
                        <code>Код</code>
                      </p>
                      <pre>Блок кода</pre>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Основы LaTeX</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Синтаксис</p>
                    <pre className="bg-muted p-2 rounded-md text-xs">
                      {latexExamples.formula}
                      {"\n\n"}
                      {latexExamples.fraction}
                      {"\n\n"}
                      {latexExamples.squareRoot}
                      {"\n\n"}
                      {latexExamples.sum}
                      {"\n\n"}
                      {latexExamples.matrix}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Результат</p>
                    <div className="bg-muted p-2 rounded-md text-xs">
                      <p>Формула Эйнштейна: E = mc²</p>
                      <p>Дробь: a/b</p>
                      <p>Корень: √(x² + y²)</p>
                      <p>Сумма: Σ(i=1 до n) i = n(n+1)/2</p>
                      <p>Матрица 2×2</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Советы</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Используйте предпросмотр для проверки форматирования перед сохранением.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Для вставки изображений в текст используйте кнопку "Вставить" или синтаксис Markdown.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Формулы LaTeX должны быть обрамлены двойными знаками доллара: $$формула$$.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Для сложных формул используйте готовые шаблоны или редактор LaTeX.</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </form>
  )
}
