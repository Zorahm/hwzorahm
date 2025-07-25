"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { GraduationCap, Pencil, Plus, Trash2, Upload, X, FileText, Calendar, Clock, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Badge } from "@/components/ui/badge"
import { ImportExams } from "./import-exams"

interface ExamFile {
  id?: number
  filename: string
  fileUrl: string
  examId?: number
}

interface Exam {
  id: number
  weekId: number | null
  subject: string
  date: string
  room: string | null
  notes: string | null
  theoryContent: string | null
  practiceContent: string | null
  files: ExamFile[]
}

interface AdminExamsProps {
  weekId?: number
}

export function AdminExams({ weekId }: AdminExamsProps) {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExamId, setEditingExamId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("theory")
  const [showImportForm, setShowImportForm] = useState(false)

  // Форма
  const [subject, setSubject] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [room, setRoom] = useState("")
  const [notes, setNotes] = useState("")
  const [theoryContent, setTheoryContent] = useState("")
  const [practiceContent, setPracticeContent] = useState("")
  const [files, setFiles] = useState<ExamFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formLoading, setFormLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  // Загрузка экзаменов - теперь всегда загружаем все экзамены
  const fetchExams = async () => {
    try {
      setIsLoading(true)
      // Всегда загружаем все экзамены, независимо от weekId
      const response = await fetch("/api/exams")
      if (!response.ok) {
        throw new Error("Ошибка при загрузке экзаменов")
      }
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Error fetching exams:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить экзамены",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [toast])

  // Загрузка данных экзамена для редактирования
  useEffect(() => {
    if (editingExamId) {
      const exam = exams.find((e) => e.id === editingExamId)
      if (exam) {
        setSubject(exam.subject)

        const examDate = new Date(exam.date)
        setDate(examDate.toISOString().split("T")[0])
        setTime(
          `${examDate.getHours().toString().padStart(2, "0")}:${examDate.getMinutes().toString().padStart(2, "0")}`,
        )

        setRoom(exam.room || "")
        setNotes(exam.notes || "")
        setTheoryContent(exam.theoryContent || "")
        setPracticeContent(exam.practiceContent || "")
        setFiles(exam.files || [])
      }
    } else {
      // Сбросить форму
      setSubject("")
      setDate("")
      setTime("")
      setRoom("")
      setNotes("")
      setTheoryContent("")
      setPracticeContent("")
      setFiles([])
      setUploadedFiles([])
    }
  }, [editingExamId, exams])

  // Обработчик удаления экзамена
  const handleDeleteExam = async (examId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот экзамен? Это действие нельзя отменить.")) {
      return
    }

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Ошибка при удалении экзамена")
      }

      toast({
        title: "Успешно",
        description: "Экзамен удален",
      })

      // Обновить список экзаменов
      fetchExams()
    } catch (error) {
      console.error("Error deleting exam:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить экзамен",
        variant: "destructive",
      })
    }
  }

  // Обработчик загрузки файлов
  const handleFileUpload = async (files: File[]) => {
    const uploadedFilesList: ExamFile[] = []

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Ошибка при загрузке файла ${file.name}`)
        }

        const data = await response.json()
        uploadedFilesList.push({
          filename: file.name,
          fileUrl: data.fileUrl,
        })
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error)
        toast({
          title: "Ошибка",
          description: `Не удалось загрузить файл ${file.name}`,
          variant: "destructive",
        })
      }
    }

    return uploadedFilesList
  }

  // Обработчик выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  // Удаление файла из списка
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Удаление существующего файла
  const removeExistingFile = (fileId: number) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  // Обработчик сохранения экзамена
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject || !date || !time) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    setFormLoading(true)

    try {
      // Загрузить новые файлы
      let allFiles = [...files]

      if (uploadedFiles.length > 0) {
        const uploadedFilesList = await handleFileUpload(uploadedFiles)
        allFiles = [...allFiles, ...uploadedFilesList]
      }

      // Создать дату экзамена
      const examDate = new Date(`${date}T${time}:00`)

      const url = editingExamId ? `/api/exams/${editingExamId}` : "/api/exams"
      const method = editingExamId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // weekId не передаем, API автоматически определит по дате
          subject,
          date: examDate.toISOString(),
          room: room || null,
          notes: notes || null,
          theoryContent: theoryContent || null,
          practiceContent: practiceContent || null,
          files: allFiles,
        }),
      })

      if (!response.ok) {
        throw new Error("Ошибка при сохранении экзамена")
      }

      toast({
        title: "Успешно",
        description: editingExamId ? "Экзамен обновлен" : "Экзамен добавлен",
      })

      // Сбросить форму и обновить список
      setShowForm(false)
      setEditingExamId(null)
      fetchExams()
    } catch (error) {
      console.error("Error saving exam:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить экзамен",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Управление экзаменами
        </h2>
        <p className="text-muted-foreground">
          Создавайте и редактируйте экзамены. Отображаются все экзамены независимо от недели.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => {
            setShowImportForm(!showImportForm)
            setShowForm(false)
            setEditingExamId(null)
          }}
          variant={showImportForm ? "outline" : "soft"}
          className="gap-2"
        >
          {showImportForm ? "Отменить" : "Импорт из Excel"}
          {!showImportForm && <Upload className="h-4 w-4" />}
        </Button>
        <Button
          onClick={() => {
            setEditingExamId(null)
            setShowForm(!showForm)
            setShowImportForm(false)
          }}
          variant={showForm ? "outline" : "gradient"}
          className="gap-2"
        >
          {showForm ? "Отменить" : "Добавить экзамен"}
          {!showForm && <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {showForm && (
        <Card className="admin-card border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {editingExamId ? "Редактировать экзамен" : "Добавить экзамен"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveExam} className="space-y-6">
              <div className="form-group">
                <Label htmlFor="subject" className="form-label flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Предмет
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Название предмета"
                  className="border-border/60 bg-background/30 backdrop-blur-sm"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="form-group">
                  <Label htmlFor="date" className="form-label flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Дата экзамена
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-border/60 bg-background/30 backdrop-blur-sm"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="time" className="form-label flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Время экзамена
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-border/60 bg-background/30 backdrop-blur-sm"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="room" className="form-label flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Аудитория
                  </Label>
                  <Input
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Номер аудитории"
                    className="border-border/60 bg-background/30 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="notes" className="form-label flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Примечания
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Дополнительная информация об экзамене"
                  className="min-h-[100px] border-border/60 bg-background/30 backdrop-blur-sm"
                />
              </div>

              <div className="form-group">
                <Label className="form-label flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Материалы экзамена
                </Label>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full custom-tabs">
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger
                      value="theory"
                      className={`custom-tab ${activeTab === "theory" ? "custom-tab-active" : ""}`}
                    >
                      Теоретическая часть
                    </TabsTrigger>
                    <TabsTrigger
                      value="practice"
                      className={`custom-tab ${activeTab === "practice" ? "custom-tab-active" : ""}`}
                    >
                      Практическая часть
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="theory" className="space-y-4">
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="theory-content" className="form-label flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Теоретическая часть (Markdown + LaTeX)
                        </Label>
                        <Button
                          type="button"
                          variant="soft"
                          size="sm"
                          className="text-xs"
                          onClick={() => setActiveTab("preview-theory")}
                        >
                          Предпросмотр
                        </Button>
                      </div>
                      <Textarea
                        id="theory-content"
                        value={theoryContent || ""}
                        onChange={(e) => setTheoryContent(e.target.value)}
                        placeholder="Введите теоретическую часть экзамена с использованием Markdown и LaTeX"
                        className="min-h-[300px] font-mono text-sm border-border/60 bg-background/30 backdrop-blur-sm"
                      />
                      <p className="form-hint">
                        Поддерживается Markdown и LaTeX. Например: **жирный текст**, *курсив*, $E=mc^2$
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="practice" className="space-y-4">
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="practice-content" className="form-label flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Практическая часть (Markdown + LaTeX)
                        </Label>
                        <Button
                          type="button"
                          variant="soft"
                          size="sm"
                          className="text-xs"
                          onClick={() => setActiveTab("preview-practice")}
                        >
                          Предпросмотр
                        </Button>
                      </div>
                      <Textarea
                        id="practice-content"
                        value={practiceContent || ""}
                        onChange={(e) => setPracticeContent(e.target.value)}
                        placeholder="Введите практическую часть экзамена с использованием Markdown и LaTeX"
                        className="min-h-[300px] font-mono text-sm border-border/60 bg-background/30 backdrop-blur-sm"
                      />
                      <p className="form-hint">
                        Поддерживается Markdown и LaTeX. Например: **жирный текст**, *курсив*, $E=mc^2$
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview-theory" className="space-y-4">
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <Label className="form-label flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Предпросмотр теоретической части
                        </Label>
                        <Button
                          type="button"
                          variant="soft"
                          size="sm"
                          className="text-xs"
                          onClick={() => setActiveTab("theory")}
                        >
                          Вернуться к редактированию
                        </Button>
                      </div>
                      <div className="border border-border/60 rounded-lg p-4 min-h-[300px] bg-background/30 backdrop-blur-sm">
                        {theoryContent ? (
                          <MarkdownRenderer content={theoryContent} />
                        ) : (
                          <p className="text-muted-foreground">Нет содержимого для предпросмотра</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview-practice" className="space-y-4">
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <Label className="form-label flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Предпросмотр практической части
                        </Label>
                        <Button
                          type="button"
                          variant="soft"
                          size="sm"
                          className="text-xs"
                          onClick={() => setActiveTab("practice")}
                        >
                          Вернуться к редактированию
                        </Button>
                      </div>
                      <div className="border border-border/60 rounded-lg p-4 min-h-[300px] bg-background/30 backdrop-blur-sm">
                        {practiceContent ? (
                          <MarkdownRenderer content={practiceContent} />
                        ) : (
                          <p className="text-muted-foreground">Нет содержимого для предпросмотра</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="form-group">
                <Label className="form-label flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Файлы
                </Label>
                <div className="space-y-4">
                  {/* Существующие файлы */}
                  {files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm mb-2">Прикрепленные файлы:</p>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 backdrop-blur-sm text-sm"
                          >
                            <span className="truncate flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              {file.filename}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeExistingFile(file.id!)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Новые файлы */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm mb-2">Новые файлы (будут загружены при сохранении):</p>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 backdrop-blur-sm text-sm"
                          >
                            <span className="truncate flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              {file.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed border-border/60 bg-background/30 backdrop-blur-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Загрузить файлы
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="gradient" className="gap-2" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showImportForm && <ImportExams onSuccess={fetchExams} />}

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="admin-card shimmer">
              <CardContent className="p-4">
                <div className="h-6 w-3/4 bg-secondary/50 rounded-md mb-3"></div>
                <div className="h-4 w-1/2 bg-secondary/30 rounded-md"></div>
              </CardContent>
            </Card>
          ))
        ) : exams.length > 0 ? (
          exams
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((exam) => (
              <Card key={exam.id} className="admin-card hover-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-lg">{exam.subject}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => {
                          setEditingExamId(exam.id)
                          setShowForm(true)
                        }}
                        className="h-8 gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Изменить</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
                        className="h-8 gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Удалить</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="soft" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(exam.date)}
                    </Badge>

                    {exam.room && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Аудитория: {exam.room}
                      </Badge>
                    )}
                  </div>

                  {exam.notes && <p className="mt-2 text-sm text-muted-foreground">{exam.notes}</p>}

                  {/* Показываем количество файлов и наличие теории/практики */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exam.files.length > 0 && (
                      <Badge className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {exam.files.length} файл(ов)
                      </Badge>
                    )}
                    {exam.theoryContent && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Теория
                      </Badge>
                    )}
                    {exam.practiceContent && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Практика
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">Нет экзаменов</h3>
            <p className="text-muted-foreground mb-4">Экзамены еще не добавлены в систему</p>
            <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить экзамен
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}