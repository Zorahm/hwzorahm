"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Clock,
  AlertCircle,
  MapPin,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface ExamFile {
  id: number
  filename: string
  fileUrl: string
  examId: number
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

interface ExamsListProps {
  weekId?: number
  limit?: number
}

export function ExamsList({ weekId, limit }: ExamsListProps) {
  const [examsData, setExamsData] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedExams, setExpandedExams] = useState<Record<number, boolean>>({})
  const [currentTime, setCurrentTime] = useState(new Date())
  const { toast } = useToast()

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        // Всегда загружаем все экзамены, независимо от weekId
        const response = await fetch("/api/exams")

        if (!response.ok) {
          throw new Error("Ошибка при загрузке экзаменов")
        }

        const data = await response.json()
        setExamsData(data)
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

    fetchExams()
  }, [toast])

  // Определение типа экзамена из примечаний
  const getExamType = (notes: string | null): { type: string; color: string } => {
    if (!notes) return { type: "Экзамен", color: "bg-red-500/20 text-red-300 border-red-500/30" }

    const lowerNotes = notes.toLowerCase()

    if (lowerNotes.includes("зач")) {
      return { type: "Зачет", color: "bg-green-500/20 text-green-300 border-green-500/30" }
    } else if (lowerNotes.includes("экз")) {
      return { type: "Экзамен", color: "bg-red-500/20 text-red-300 border-red-500/30" }
    }

    return { type: "Экзамен", color: "bg-red-500/20 text-red-300 border-red-500/30" }
  }

  const getExamStatus = (dateString: string) => {
    const examDate = new Date(dateString)
    const now = new Date(currentTime)

    // Устанавливаем время на начало дня для корректного сравнения дат
    const examDateStart = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate())
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const diffMs = examDate.getTime() - now.getTime()
    const diffDays = Math.floor((examDateStart.getTime() - nowStart.getTime()) / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMs < 0) {
      return { status: "completed", text: "Завершен", timeLeft: null }
    } else if (diffDays === 0) {
      // Сегодня - показываем часы и минуты
      if (diffHours < 1) {
        return { status: "imminent", text: `Через ${diffMinutes} мин`, timeLeft: diffMinutes }
      } else {
        return { status: "today", text: `Через ${diffHours} ч`, timeLeft: diffHours }
      }
    } else if (diffDays === 1) {
      return { status: "tomorrow", text: "Завтра", timeLeft: diffDays }
    } else if (diffDays === 2) {
      return { status: "soon", text: "Послезавтра", timeLeft: diffDays }
    } else if (diffDays <= 7) {
      return { status: "soon", text: `Через ${diffDays} дн.`, timeLeft: diffDays }
    } else {
      return { status: "upcoming", text: `Через ${diffDays} дн.`, timeLeft: diffDays }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
      weekday: new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
      }).format(date),
    }
  }

  const getStatusBadge = (status: string, text: string) => {
    const baseClasses = "font-medium transition-all duration-200"

    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className={`${baseClasses} border-gray-500/30 text-gray-400 bg-gray-500/10`}>
            {text}
          </Badge>
        )
      case "imminent":
        return (
          <Badge
            className={`${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg animate-pulse`}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            {text}
          </Badge>
        )
      case "today":
        return (
          <Badge className={`${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30 shadow-md`}>
            <Clock className="w-3 h-3 mr-1" />
            {text}
          </Badge>
        )
      case "tomorrow":
        return (
          <Badge className={`${baseClasses} bg-orange-500/20 text-orange-300 border border-orange-500/30 shadow-md`}>
            {text}
          </Badge>
        )
      case "soon":
        return (
          <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-sm`}>
            {text}
          </Badge>
        )
      case "upcoming":
        return (
          <Badge className={`${baseClasses} bg-green-500/20 text-green-300 border border-green-500/30`}>{text}</Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-white/10 text-gray-300">
            {text}
          </Badge>
        )
    }
  }

  // Sort exams: upcoming first, then by date
  const sortedExams = [...examsData].sort((a, b) => {
    const statusA = getExamStatus(a.date)
    const statusB = getExamStatus(b.date)

    // Completed exams go to the end
    if (statusA.status === "completed" && statusB.status !== "completed") return 1
    if (statusA.status !== "completed" && statusB.status === "completed") return -1

    // Sort by date
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Auto-focus on next upcoming exam
  const nextUpcomingExam = sortedExams.find((exam) => getExamStatus(exam.date).status !== "completed")
  const displayExams = limit ? sortedExams.slice(0, limit) : sortedExams

  const toggleExamExpand = (examId: number) => {
    setExpandedExams((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
          <p className="text-gray-400 font-medium">Загрузка экзаменов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayExams.length > 0 ? (
        displayExams.map((exam) => {
          const examStatus = getExamStatus(exam.date)
          const dateTime = formatDateTime(exam.date)
          const isNextUpcoming = nextUpcomingExam?.id === exam.id
          const examType = getExamType(exam.notes)

          return (
            <Card
              key={exam.id}
              className={`
                border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:bg-white/10
                ${isNextUpcoming ? "ring-2 ring-blue-500/30 border-blue-500/30 shadow-md shadow-blue-500/10" : ""}
                ${examStatus.status === "completed" ? "opacity-75" : ""}
              `}
            >
              <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`
                            h-10 w-10 rounded-lg flex items-center justify-center transition-colors border
                            ${isNextUpcoming ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"}
                          `}
                          >
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg leading-tight truncate text-white">{exam.subject}</h3>
                            {isNextUpcoming && (
                              <p className="text-xs text-blue-400 font-medium mt-1">Ближайший экзамен</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-3">
                        {getStatusBadge(examStatus.status, examStatus.text)}

                        {/* Тип экзамена */}
                        <Badge className={examType.color}>{examType.type}</Badge>
                      </div>
                    </div>

                    {/* Date and Time Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                        <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-white">{dateTime.date}</p>
                          <p className="text-xs text-gray-400 capitalize">{dateTime.weekday}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                        <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{dateTime.time}</p>
                          <p className="text-xs text-gray-400">Время проведения</p>
                        </div>
                      </div>

                      {exam.room && (
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                          <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate text-white">Ауд. {exam.room}</p>
                            <p className="text-xs text-gray-400">Аудитория</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {exam.notes && (
                      <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                        <p className="text-sm text-blue-300">{exam.notes}</p>
                      </div>
                    )}

                    {/* Expand Button */}
                    {(exam.theoryContent || exam.practiceContent || exam.files.length > 0) && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-xs hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                          onClick={() => toggleExamExpand(exam.id)}
                        >
                          {expandedExams[exam.id] ? (
                            <>
                              <span>Свернуть материалы</span>
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <span>Показать материалы</span>
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {expandedExams[exam.id] && (
                      <div className="pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                        {exam.theoryContent || exam.practiceContent || exam.files.length > 0 ? (
                          <div className="space-y-6">
                            {exam.theoryContent && (
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold mb-3 text-white">
                                  <FileText className="h-4 w-4 text-blue-400" />
                                  Теоретическая часть
                                </h4>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                                  <MarkdownRenderer content={exam.theoryContent} />
                                </div>
                              </div>
                            )}

                            {exam.practiceContent && (
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold mb-3 text-white">
                                  <FileText className="h-4 w-4 text-blue-400" />
                                  Практическая часть
                                </h4>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                                  <MarkdownRenderer content={exam.practiceContent} />
                                </div>
                              </div>
                            )}

                            {exam.files.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold mb-3 text-white">
                                  <Download className="h-4 w-4 text-blue-400" />
                                  Материалы ({exam.files.length})
                                </h4>
                                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                  {exam.files.map((file) => (
                                    <Button
                                      key={file.id}
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2 border-white/10 bg-white/5 hover:bg-white/10 justify-start overflow-hidden transition-colors text-gray-300 hover:text-white"
                                      asChild
                                    >
                                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 flex-shrink-0 text-blue-400" />
                                        <span className="truncate text-left">{file.filename}</span>
                                      </a>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                            <p className="text-gray-400 text-sm">Дополнительная информация отсутствует</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="font-medium text-lg mb-2 text-white">Нет экзаменов</h3>
          <p className="text-gray-400 text-sm">Экзамены не запланированы</p>
        </div>
      )}
    </div>
  )
}