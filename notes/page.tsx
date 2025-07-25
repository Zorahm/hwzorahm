"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { NoteView } from "@/components/note-view"
import {
  Search,
  FileText,
  BookOpen,
  SortAsc,
  SortDesc,
  Grid,
  List,
  ImageIcon,
  Clock,
  BookMarked,
  Tag,
  X,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeekSelector } from "@/components/week-selector"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [viewMode, setViewMode] = useState<string>("list")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [hasImages, setHasImages] = useState<boolean | null>(null)

  // Загрузка недель
  useEffect(() => {
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

    fetchWeeks()
  }, [])

  // Загрузка конспектов
  useEffect(() => {
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

        // Если есть конспекты, выбираем первый для отображения
        if (data.length > 0) {
          setSelectedNote(data[0])
        }
      } catch (error) {
        console.error("Error fetching notes:", error)
        toast.error("Не удалось загрузить конспекты")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [])

  // Обработчик изменения недели
  const handleWeekChange = (weekId: number) => {
    setSelectedWeekId(weekId)
  }

  // Фильтрация и сортировка конспектов
  const filterAndSortNotes = useCallback(() => {
    let filtered = [...notes]

    // Фильтрация по вкладке
    if (activeTab === "current" && selectedWeekId) {
      filtered = filtered.filter((note) => note.weekId === selectedWeekId)
    }

    // Фильтрация по предмету
    if (selectedSubject) {
      filtered = filtered.filter((note) => note.subject === selectedSubject)
    }

    // Фильтрация по наличию изображений
    if (hasImages !== null) {
      filtered = filtered.filter((note) =>
        hasImages ? note.images && note.images.length > 0 : !note.images || note.images.length === 0,
      )
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

    // Сортировка
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      } else if (sortOrder === "alphabetical") {
        return a.title.localeCompare(b.title)
      } else if (sortOrder === "subject") {
        return a.subject.localeCompare(b.subject)
      }
      return 0
    })

    setFilteredNotes(filtered)

    // Если после фильтрации выбранный конспект не входит в отфильтрованные,
    // выбираем первый из отфильтрованных (если есть)
    if (filtered.length > 0) {
      if (!selectedNote || !filtered.some((note) => note.id === selectedNote.id)) {
        setSelectedNote(filtered[0])
      }
    } else {
      setSelectedNote(null)
    }
  }, [notes, activeTab, selectedWeekId, selectedSubject, searchQuery, sortOrder, hasImages, selectedNote])

  // Применяем фильтрацию и сортировку при изменении параметров
  useEffect(() => {
    filterAndSortNotes()
  }, [filterAndSortNotes])

  // Обработчик выбора конспекта
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)

    // Для мобильных устройств прокручиваем к содержимому конспекта
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById("note-content")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedSubject("")
    setHasImages(null)
    setSortOrder("newest")
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Рендер скелетона загрузки
  const renderSkeletons = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Рендер карточки конспекта в режиме списка
  const renderListItem = (note: Note) => (
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
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(note.updatedAt)}</span>
              </div>
              {note.images && note.images.length > 0 && (
                <div className="flex items-center">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  <span>{note.images.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Рендер карточки конспекта в режиме сетки
  const renderGridItem = (note: Note) => (
    <Card
      key={note.id}
      className={`cursor-pointer transition-colors hover:bg-muted/50 h-full ${
        selectedNote?.id === note.id ? "bg-muted border-primary" : ""
      }`}
      onClick={() => handleSelectNote(note)}
    >
      <div className="flex flex-col h-full">
        {note.images && note.images.length > 0 ? (
          <div className="h-32 overflow-hidden border-b">
            <img
              src={note.images[0].imageUrl || "/placeholder.svg"}
              alt={note.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center bg-muted/30 border-b">
            <BookMarked className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <CardContent className="p-3 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">{note.title}</h3>
            <p className="text-xs text-muted-foreground">{note.subject}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(note.updatedAt).split(" ")[0]}</span>
            </div>
            {note.images && note.images.length > 0 && (
              <div className="flex items-center">
                <ImageIcon className="h-3 w-3 mr-1" />
                <span>{note.images.length}</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl">Конспекты</CardTitle>
              <CardDescription>Учебные материалы и конспекты лекций</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all" className="flex-1 md:flex-none">
                  Все конспекты
                </TabsTrigger>
                <TabsTrigger value="current" className="flex-1 md:flex-none">
                  Текущая неделя
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                <ToggleGroupItem value="list" aria-label="Список" title="Список">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Сетка" title="Сетка">
                  <Grid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <SortDesc className="h-4 w-4 mr-2" /> Сначала новые
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center">
                      <SortAsc className="h-4 w-4 mr-2" /> Сначала старые
                    </div>
                  </SelectItem>
                  <SelectItem value="alphabetical">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" /> По алфавиту
                    </div>
                  </SelectItem>
                  <SelectItem value="subject">
                    <div className="flex items-center">
                      <BookMarked className="h-4 w-4 mr-2" /> По предмету
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeTab === "current" && (
            <div className="mb-4">
              <WeekSelector onWeekChange={handleWeekChange} selectedWeekId={selectedWeekId} />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или содержанию..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все предметы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-subjects">Все предметы</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={hasImages === null ? "all-images" : hasImages ? "with-images" : "without-images"}
                onValueChange={(value) => {
                  if (value === "with-images") setHasImages(true)
                  else if (value === "without-images") setHasImages(false)
                  else setHasImages(null)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Изображения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-images">Все конспекты</SelectItem>
                  <SelectItem value="with-images">С изображениями</SelectItem>
                  <SelectItem value="without-images">Без изображений</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={handleResetFilters} title="Сбросить фильтры">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Отображение активных фильтров */}
          {(searchQuery || selectedSubject || hasImages !== null) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" /> {searchQuery}
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedSubject && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BookMarked className="h-3 w-3" /> {selectedSubject}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setSelectedSubject("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {hasImages !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> {hasImages ? "С изображениями" : "Без изображений"}
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setHasImages(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}

          <div className="text-sm font-medium mb-4">Найдено конспектов: {filteredNotes.length}</div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">{renderSkeletons()}</div>
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-8 flex justify-center items-center">
                    <div className="loader"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || selectedSubject || hasImages !== null
                ? "Конспекты не найдены. Попробуйте изменить параметры поиска."
                : "Нет доступных конспектов."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ScrollArea className="h-[70vh] pr-4">
                  <div className={viewMode === "list" ? "space-y-2" : "grid grid-cols-2 gap-2"}>
                    {filteredNotes.map((note) => (viewMode === "list" ? renderListItem(note) : renderGridItem(note)))}
                  </div>
                </ScrollArea>
              </div>

              <div id="note-content" className="md:col-span-2">
                {selectedNote ? (
                  <NoteView note={selectedNote} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">Выберите конспект для просмотра</h3>
                    <p className="text-muted-foreground mt-2">
                      Выберите конспект из списка слева для просмотра его содержимого
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
