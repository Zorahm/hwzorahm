"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { NoteForm } from "@/components/admin/note-form"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, FileText, Calendar, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeekSelector } from "@/components/week-selector"
import { MarkdownRenderer } from "@/components/markdown-renderer"

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

export function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  // Загрузка конспектов
  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notes")
      if (!response.ok) {
        throw new Error("Ошибка при загрузке конспектов")
      }
      const data = await response.json()
      setNotes(data)
      setFilteredNotes(data)

      // Извлекаем уникальные предметы
      const uniqueSubjects = Array.from(new Set(data.map((note: Note) => note.subject)))
      setSubjects(uniqueSubjects as string[])
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Не удалось загрузить конспекты")
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузка недель
  const fetchWeeks = async () => {
    try {
      const response = await fetch("/api/weeks")
      if (!response.ok) {
        throw new Error("Ошибка при загрузке недель")
      }
      const data = await response.json()
      setWeeks(data)

      // Находим текущую неделю
      const currentWeek = data.find((week: Week) => week.status === "current")
      if (currentWeek) {
        setSelectedWeekId(currentWeek.id)
      }
    } catch (error) {
      console.error("Error fetching weeks:", error)
      toast.error("Не удалось загрузить недели")
    }
  }

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchNotes()
    fetchWeeks()
  }, [])

  // Фильтрация конспектов при изменении поискового запроса, предмета или недели
  useEffect(() => {
    let filtered = notes

    // Фильтрация по вкладке
    if (activeTab === "current" && selectedWeekId) {
      filtered = filtered.filter((note) => note.weekId === selectedWeekId)
    }

    // Фильтрация по предмету
    if (selectedSubject) {
      filtered = filtered.filter((note) => note.subject === selectedSubject)
    }

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.subject.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query),
      )
    }

    setFilteredNotes(filtered)
  }, [searchQuery, selectedSubject, selectedWeekId, notes, activeTab])

  // Обработчик изменения недели
  const handleWeekChange = (weekId: number) => {
    setSelectedWeekId(weekId)
  }

  // Обработчик создания нового конспекта
  const handleCreateNote = () => {
    setSelectedNote(null)
    setIsEditing(true)
  }

  // Обработчик редактирования конспекта
  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(true)
  }

  // Обработчик удаления конспекта
  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Ошибка при удалении конспекта")
      }

      // Обновляем список конспектов
      setNotes((prev) => prev.filter((note) => note.id !== id))
      toast.success("Конспект успешно удален")

      // Если удаляем выбранный конспект, сбрасываем выбор
      if (selectedNote?.id === id) {
        setSelectedNote(null)
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Не удалось удалить конспект")
    }
  }

  // Обработчик сохранения конспекта
  const handleSaveNote = async (data: any) => {
    try {
      let response
      if (selectedNote) {
        // Обновление существующего конспекта
        response = await fetch(`/api/notes/${selectedNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      } else {
        // Создание нового конспекта
        response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при сохранении конспекта")
      }

      const savedNote = await response.json()

      // Обновляем список конспектов
      if (selectedNote) {
        setNotes((prev) => prev.map((note) => (note.id === selectedNote.id ? savedNote : note)))
        toast.success("Конспект успешно обновлен")
      } else {
        setNotes((prev) => [savedNote, ...prev])
        toast.success("Конспект успешно создан")
      }

      // Закрываем форму редактирования
      setIsEditing(false)
      setSelectedNote(savedNote)
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось сохранить конспект")
    }
  }

  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // Обработчик выбора конспекта
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
  }

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedSubject("")
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all" className="flex-1 md:flex-none">
                Все конспекты
              </TabsTrigger>
              <TabsTrigger value="current" className="flex-1 md:flex-none">
                Текущая неделя
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button onClick={handleCreateNote} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Добавить конспект
        </Button>
      </div>

      {activeTab === "current" && (
        <div className="mb-4">
          <WeekSelector onWeekChange={handleWeekChange} selectedWeekId={selectedWeekId} />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или содержанию..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все предметы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все предметы</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleResetFilters} title="Сбросить фильтры">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="loader"></div>
        </div>
      ) : isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedNote ? "Редактирование конспекта" : "Новый конспект"}</CardTitle>
            <CardDescription>
              {selectedNote ? "Измените данные конспекта и нажмите Сохранить" : "Заполните форму и нажмите Сохранить"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NoteForm note={selectedNote} onSave={handleSaveNote} onCancel={handleCancelEdit} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="text-sm font-medium mb-2">
              Найдено конспектов: {filteredNotes.length} из {notes.length}
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || selectedSubject
                    ? "Конспекты не найдены. Попробуйте изменить параметры поиска."
                    : "Нет доступных конспектов."}
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedNote?.id === note.id ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 w-full">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium leading-tight">{note.title}</h3>
                            {note.week && (
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {note.week.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{note.subject}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(note.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedNote ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{selectedNote.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <span className="font-medium">{selectedNote.subject}</span>
                        {selectedNote.week && (
                          <Badge variant="outline" className="ml-2">
                            {selectedNote.week.name}
                          </Badge>
                        )}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Обновлено: {formatDate(selectedNote.updatedAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Создано: {formatDate(selectedNote.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button variant="outline" size="sm" onClick={() => handleEditNote(selectedNote)}>
                        <Edit className="h-4 w-4 mr-1" /> Редактировать
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" /> Удалить
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удаление конспекта</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить конспект "{selectedNote.title}"? Это действие нельзя
                              отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNote(selectedNote.id)}>
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {selectedNote.images && selectedNote.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {selectedNote.images.map((image) => (
                        <div key={image.id} className="border rounded-md overflow-hidden h-40">
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
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownRenderer content={selectedNote.content} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">Выберите конспект для просмотра</h3>
                <p className="text-muted-foreground mt-2">
                  Выберите конспект из списка слева для просмотра его содержимого или создайте новый конспект
                </p>
                <Button onClick={handleCreateNote} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Создать конспект
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
