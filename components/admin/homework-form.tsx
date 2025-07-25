"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  X,
  Upload,
  FileText,
  Paperclip,
  Calendar,
  Clock,
  BookOpen,
  Save,
  AlertTriangle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  File,
  CalendarDays,
} from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
// Добавляем импорт для Select компонента
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HomeworkFile {
  id?: number
  filename: string
  fileUrl: string
}

// Обновляем интерфейс HomeworkFormProps
interface HomeworkFormProps {
  homeworkId?: number
  weekId?: number
  subject?: string
  scheduleId?: number // Добавляем scheduleId
  onSuccess: () => void
  onCancel?: () => void
}

// Добавляем интерфейс для элемента расписания
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
  lessonType: string | null
}

// Примеры Markdown для справки
const MARKDOWN_EXAMPLES = `
## Заголовки
# Заголовок 1
## Заголовок 2
### Заголовок 3

## Форматирование текста
**Жирный текст**
*Курсив*
~~Зачеркнутый текст~~

## Списки
- Пункт 1
- Пункт 2
  - Подпункт 2.1
  - Подпункт 2.2
  
1. Нумерованный список
2. Второй пункт

## Ссылки и изображения
[Текст ссылки](https://example.com)
![Описание изображения](URL изображения)

## Код
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## Таблицы
| Заголовок 1 | Заголовок 2 |
|-------------|-------------|
| Ячейка 1    | Ячейка 2    |
| Ячейка 3    | Ячейка 4    |

## Цитаты
> Это цитата
> Продолжение цитаты
`

// В функции HomeworkForm добавляем состояние для хранения элементов расписания
export function HomeworkForm({ homeworkId, weekId, subject, scheduleId, onSuccess, onCancel }: HomeworkFormProps) {
  // Состояние формы
  const [formState, setFormState] = useState({
    description: "",
    shortDescription: "",
    detailedDescription: "",
    deadline: "",
    deadlineTime: "",
    specificDate: new Date(),
    files: [] as HomeworkFile[],
    fileUrl: null as string | null,
    scheduleId: scheduleId || (null as number | null), // Добавляем scheduleId в состояние формы
  })

  // Добавляем состояние для хранения элементов расписания
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)

  // UI состояния
  const [uiState, setUiState] = useState({
    isLoading: false,
    isUploading: false,
    previewTab: "edit" as "edit" | "preview",
    markdownHelp: false,
    uploadError: null as string | null,
    isFullscreen: false,
    isDatePickerOpen: false,
  })

  const { toast } = useToast()
  const isMobile = useMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const markdownEditorRef = useRef<HTMLDivElement>(null)

  // Обновление состояния формы
  const updateFormState = (field: keyof typeof formState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Обновление UI состояния
  const updateUiState = (field: keyof typeof uiState, value: any) => {
    setUiState((prev) => ({ ...prev, [field]: value }))
  }

  // Загрузка элементов расписания для выбранной недели и предмета
  useEffect(() => {
    if (weekId && subject) {
      const fetchScheduleItems = async () => {
        try {
          setIsLoadingSchedule(true)
          const response = await fetch(`/api/schedule?weekId=${weekId}`)
          if (!response.ok) {
            throw new Error("Ошибка при загрузке расписания")
          }
          const data = await response.json()

          // Фильтруем элементы расписания по предмету
          const filteredItems = data.filter((item: ScheduleItem) => item.subject === subject)
          setScheduleItems(filteredItems)

          // Если scheduleId не задан и есть элементы расписания, устанавливаем первый элемент по умолчанию
          if (!formState.scheduleId && filteredItems.length > 0) {
            updateFormState("scheduleId", filteredItems[0].id)
          }
        } catch (error) {
          console.error("Error fetching schedule items:", error)
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить расписание",
            variant: "destructive",
          })
        } finally {
          setIsLoadingSchedule(false)
        }
      }

      fetchScheduleItems()
    }
  }, [weekId, subject, toast])

  // Загрузка данных существующего домашнего задания
  useEffect(() => {
    if (homeworkId) {
      const fetchHomework = async () => {
        try {
          const response = await fetch(`/api/homework/${homeworkId}`)
          if (!response.ok) {
            throw new Error("Ошибка при загрузке домашнего задания")
          }
          const data = await response.json()

          const deadlineDate = new Date(data.deadline)

          setFormState({
            description: data.description,
            shortDescription: data.shortDescription || "",
            detailedDescription: data.detailedDescription || "",
            deadline: deadlineDate.toISOString().split("T")[0],
            deadlineTime: `${deadlineDate.getHours().toString().padStart(2, "0")}:${deadlineDate
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
            specificDate: data.specificDate ? new Date(data.specificDate) : deadlineDate,
            fileUrl: data.fileUrl,
            files: data.files || [],
            scheduleId: data.scheduleId || null,
          })
        } catch (error) {
          console.error("Error fetching homework:", error)
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные домашнего задания",
            variant: "destructive",
          })
        }
      }
      fetchHomework()
    } else {
      // Установить дефолтные значения для новой записи
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)

      updateFormState("deadline", nextWeek.toISOString().split("T")[0])
      updateFormState("deadlineTime", "23:59")
      updateFormState("specificDate", nextWeek)
      updateFormState("scheduleId", scheduleId || null)
    }
  }, [homeworkId, toast, scheduleId])

  // Загрузка файла
  const uploadFile = async (file: File): Promise<HomeworkFile> => {
    if (!file) throw new Error("Файл не выбран")

    const formData = new FormData()
    formData.append("file", file)

    try {
      updateUiState("isUploading", true)
      updateUiState("uploadError", null)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Ошибка при загрузке файла")
      }

      const data = await response.json()
      return {
        filename: file.name,
        fileUrl: data.fileUrl,
      }
    } catch (error: any) {
      console.error("Error uploading file:", error)
      updateUiState("uploadError", error.message || "Не удалось загрузить файл")
      throw new Error(error.message || "Не удалось загрузить файл")
    } finally {
      updateUiState("isUploading", false)
    }
  }

  // Обработка загрузки файла
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      updateUiState("isUploading", true)
      const newFiles: HomeworkFile[] = []

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const uploadedFile = await uploadFile(file)
        newFiles.push(uploadedFile)
      }

      updateFormState("files", [...formState.files, ...newFiles])

      toast({
        title: "Успех",
        description: `Файл${newFiles.length > 1 ? "ы" : ""} успешно загружен${newFiles.length > 1 ? "ы" : ""}`,
      })

      // Очистить input
      e.target.value = ""
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось загрузить файл",
        variant: "destructive",
      })
    } finally {
      updateUiState("isUploading", false)
    }
  }

  // Вызов диалога выбора файла
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Удаление файла
  const removeFile = (index: number) => {
    const newFiles = [...formState.files]
    newFiles.splice(index, 1)
    updateFormState("files", newFiles)
  }

  // Обработка выбора даты
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      updateFormState("specificDate", date)
      updateFormState("deadline", date.toISOString().split("T")[0])
      updateUiState("isDatePickerOpen", false)
    }
  }

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!weekId || !subject || !formState.description || !formState.deadline || !formState.deadlineTime) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    updateUiState("isLoading", true)

    try {
      // Создать дату дедлайна
      const deadlineDate = new Date(`${formState.deadline}T${formState.deadlineTime}:00`)

      const url = homeworkId ? `/api/homework/${homeworkId}` : "/api/homework"
      const method = homeworkId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekId: Number(weekId),
          subject,
          description: formState.description,
          shortDescription: formState.shortDescription || null,
          detailedDescription: formState.detailedDescription || null,
          deadline: deadlineDate.toISOString(),
          specificDate: formState.specificDate.toISOString(),
          fileUrl: formState.fileUrl,
          files: formState.files,
          forSpecificDateOnly: true,
          scheduleId: formState.scheduleId, // Добавляем scheduleId в запрос
        }),
      })

      if (!response.ok) {
        throw new Error("Не удалось сохранить домашнее задание")
      }

      toast({
        title: "Успех",
        description: "Домашнее задание успешно сохранено",
      })
      onSuccess()
    } catch (error: any) {
      console.error("Error saving homework:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить домашнее задание",
        variant: "destructive",
      })
    } finally {
      updateUiState("isLoading", false)
    }
  }

  // Получение иконки файла в зависимости от расширения
  const getFileIcon = useMemo(() => {
    return (filename: string) => {
      const extension = filename.split(".").pop()?.toLowerCase()

      if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
        return <File className="h-4 w-4 text-primary flex-shrink-0" />
      } else if (["pdf"].includes(extension || "")) {
        return <FileText className="h-4 w-4 text-red-400 flex-shrink-0" />
      } else if (["doc", "docx"].includes(extension || "")) {
        return <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
      } else if (["xls", "xlsx"].includes(extension || "")) {
        return <FileText className="h-4 w-4 text-green-400 flex-shrink-0" />
      } else if (["ppt", "pptx"].includes(extension || "")) {
        return <FileText className="h-4 w-4 text-orange-400 flex-shrink-0" />
      } else {
        return <FileText className="h-4 w-4 text-primary flex-shrink-0" />
      }
    }
  }, [])

  // Получение времени по слоту
  const getTimeBySlot = (slot: number): string => {
    switch (slot) {
      case 0:
        return "8:30–10:00"
      case 1:
        return "10:10–11:40"
      case 2:
        return "11:50–13:20"
      case 3:
        return "13:50–15:20"
      case 4:
        return "15:30–17:00"
      case 5:
        return "17:10–18:40"
      default:
        return ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="form-container">
        {/* Левая колонка - Информация о задании и основное содержание */}
        <div className="space-y-4 sm:space-y-6">
          {/* Информация о предмете и неделе */}
          <Card className="admin-card shadow-sm">
            <CardHeader className="border-b border-border/30 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Информация о задании
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Основные параметры домашнего задания</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="subject" className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    Предмет
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    readOnly
                    className="bg-secondary/50 border-border/30 h-9"
                    aria-label="Предмет"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="weekId" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    ID недели
                  </Label>
                  <Input
                    id="weekId"
                    value={weekId}
                    readOnly
                    className="bg-secondary/50 border-border/30 h-9"
                    aria-label="ID недели"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Основное содержание */}
          <Card className="admin-card shadow-sm">
            <CardHeader className="border-b border-border/30 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Содержание задания
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Описание домашнего задания для студентов</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="shortDescription" className="flex items-center gap-2 text-sm">
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Краткое описание
                </Label>
                <Input
                  id="shortDescription"
                  value={formState.shortDescription}
                  onChange={(e) => updateFormState("shortDescription", e.target.value)}
                  placeholder="Краткое описание задания (будет отображаться в списке)"
                  className="border-border/30 h-9"
                  aria-label="Краткое описание"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2 text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Основное описание
                </Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => updateFormState("description", e.target.value)}
                  placeholder={`Введите домашнее задание по предмету "${subject}"`}
                  className="min-h-[100px] sm:min-h-[120px] border-border/30"
                  required
                  aria-label="Основное описание"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Подробное описание (Markdown)
                </Label>
                <div ref={markdownEditorRef} className="border border-border/30 rounded-md overflow-hidden">
                  <Tabs
                    value={uiState.previewTab}
                    onValueChange={(value) => updateUiState("previewTab", value as "edit" | "preview")}
                  >
                    <TabsList className="w-full bg-secondary/50 rounded-none border-b border-border/30">
                      <TabsTrigger value="edit" className="flex-1 rounded-none data-[state=active]:bg-background">
                        Редактирование
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex-1 rounded-none data-[state=active]:bg-background">
                        Предпросмотр
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="p-0 m-0">
                      <Textarea
                        ref={textareaRef}
                        value={formState.detailedDescription}
                        onChange={(e) => updateFormState("detailedDescription", e.target.value)}
                        placeholder="Подробное описание с поддержкой Markdown форматирования"
                        className="min-h-[200px] sm:min-h-[250px] border-0 rounded-none font-mono resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </TabsContent>
                    <TabsContent
                      value="preview"
                      className="p-3 sm:p-4 m-0 min-h-[200px] sm:min-h-[250px] bg-secondary/10"
                    >
                      <ScrollArea className="h-[200px] sm:h-[250px]">
                        {formState.detailedDescription ? (
                          <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <MarkdownRenderer content={formState.detailedDescription} />
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-30" />
                            <p>Нет содержимого для предпросмотра</p>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 sm:h-8 px-2 text-xs rounded-md flex items-center gap-1"
                    >
                      <HelpCircle className="h-3 w-3" />
                      Справка по Markdown
                      <ChevronDown className="h-3 w-3 group-data-[state=open]:hidden" />
                      <ChevronUp className="h-3 w-3 hidden group-data-[state=open]:block" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Alert className="bg-secondary/50 border-border/30 mb-2 rounded-md mt-2">
                      <AlertDescription>
                        <ScrollArea className="h-[120px] sm:h-[150px]">
                          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                            <MarkdownRenderer content={MARKDOWN_EXAMPLES} />
                          </div>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - Дедлайн и файлы */}
        <div className="space-y-4 sm:space-y-6">
          {/* Дедлайн */}
          <Card className="admin-card shadow-sm">
            <CardHeader className="border-b border-border/30 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Дедлайн и дата
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Установите дату и время сдачи задания</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {/* Выбор конкретной даты */}

                {/* Выбор конкретного дня недели из расписания */}
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="scheduleId" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    День недели
                  </Label>
                  {isLoadingSchedule ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Загрузка расписания...
                    </div>
                  ) : scheduleItems.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Нет занятий по предмету "{subject}" в расписании
                    </div>
                  ) : (
                    <Select
                      value={formState.scheduleId?.toString() || ""}
                      onValueChange={(value) => updateFormState("scheduleId", value ? Number(value) : null)}
                    >
                      <SelectTrigger className="w-full border-border/30 h-9">
                        <SelectValue placeholder="Выберите день недели" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleItems.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.day},{" "}
                            {item.customTime && item.startTime
                              ? `${item.startTime}–${item.endTime}`
                              : getTimeBySlot(item.slot)}
                            {item.lessonType ? ` (${item.lessonType})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Выберите конкретный день недели из расписания для привязки домашнего задания
                  </p>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="specificDate" className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    Конкретная дата задания
                  </Label>
                  <Popover
                    open={uiState.isDatePickerOpen}
                    onOpenChange={(open) => updateUiState("isDatePickerOpen", open)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-border/30 h-9"
                        type="button"
                      >
                        <CalendarDays className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {formState.specificDate ? (
                          format(formState.specificDate, "PPP", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formState.specificDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Домашнее задание будет добавлено только для этой конкретной даты
                  </p>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="deadline" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    Дата дедлайна
                  </Label>
                  <Input
                    type="date"
                    id="deadline"
                    value={formState.deadline}
                    onChange={(e) => updateFormState("deadline", e.target.value)}
                    className="border-border/30 h-9"
                    required
                    aria-label="Дата дедлайна"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="deadlineTime" className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    Время дедлайна
                  </Label>
                  <Input
                    type="time"
                    id="deadlineTime"
                    value={formState.deadlineTime}
                    onChange={(e) => updateFormState("deadlineTime", e.target.value)}
                    className="border-border/30 h-9"
                    required
                    aria-label="Время дедлайна"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Файлы */}
          <Card className="admin-card shadow-sm">
            <CardHeader className="border-b border-border/30 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                Прикрепленные файлы
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Добавьте файлы к домашнему заданию</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="files" className="flex items-center gap-2 text-sm">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Загрузить файлы
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    id="files"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    aria-label="Выбрать файлы"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-border/30 rounded-md h-8"
                    disabled={uiState.isUploading}
                    onClick={triggerFileInput}
                    aria-label={uiState.isUploading ? "Загрузка..." : "Выбрать файлы"}
                  >
                    {uiState.isUploading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        Выбрать файлы
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {uiState.uploadError && (
                <Alert className="bg-destructive/10 border-destructive/30 text-destructive-foreground rounded-md">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription>{uiState.uploadError}</AlertDescription>
                </Alert>
              )}

              {formState.files.length > 0 && (
                <div className="space-y-1 sm:space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    Прикрепленные файлы ({formState.files.length})
                  </Label>
                  <ScrollArea className={formState.files.length > 5 ? "h-[200px] sm:h-[250px]" : "h-auto"}>
                    <div className="space-y-2">
                      {formState.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-md border border-border/30 bg-secondary/50"
                        >
                          <div className="flex items-center gap-2 truncate max-w-[70%]">
                            {getFileIcon(file.filename)}
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm hover:underline text-primary truncate"
                              title={file.filename}
                            >
                              {file.filename}
                            </a>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                            aria-label={`Удалить файл ${file.filename}`}
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {formState.fileUrl && (
                <Alert className="bg-secondary/50 border-border/30 rounded-md">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm">Устаревший файл (будет удален при сохранении)</span>
                      <a
                        href={formState.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-primary hover:underline"
                      >
                        Просмотреть
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="action-buttons flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={uiState.isLoading}
              >
                Отмена
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={uiState.isLoading || uiState.isUploading}
              aria-label={uiState.isLoading ? "Сохранение..." : homeworkId ? "Обновить задание" : "Создать задание"}
            >
              {uiState.isLoading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {homeworkId ? "Обновить задание" : "Создать задание"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
