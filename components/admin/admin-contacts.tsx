"use client"

import type React from "react" // Типизация React не обязательна, если используется JSX глобально

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  Mail,
  Phone,
  Clock,
  MessageCircle,
  Crown,
  Star,
  MapPin,
  Award,
  Search,
  Filter,
  BookOpen,
  Building,
  Shield,
  Zap,
  UserCheck,
  User,
  Gamepad2,
  Palette,
  Code,
  Camera,
  Megaphone,
  Users2,
} from "lucide-react"
import { toast } from "sonner"

interface Teacher {
  id: number
  name: string
  position: string
  subject: string
  email: string
  phone?: string
  office?: string
  schedule?: string
  experience?: string
  degree?: string
  avatar?: string
}

interface Student {
  id: number
  name: string
  position: string
  responsibility: string
  email: string
  phone?: string
  telegram?: string
  avatar?: string
  year: string
  gpa?: string
}

// Компонент для управления контактами
export function AdminContacts() {
  // Состояния компонента
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false)
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedStudentPosition, setSelectedStudentPosition] = useState("")
  const [selectedStudentYear, setSelectedStudentYear] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPosition, setFilterPosition] = useState("all")

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchData()
  }, [])

  // Функция для загрузки данных с API
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [teachersRes, studentsRes] = await Promise.all([fetch("/api/teachers"), fetch("/api/students")])

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData)
      } else {
        console.error("Failed to fetch teachers:", teachersRes.statusText)
        toast.error("Ошибка при загрузке преподавателей")
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData)
      } else {
        console.error("Failed to fetch students:", studentsRes.statusText)
        toast.error("Ошибка при загрузке студентов")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик отправки формы для преподавателя (добавление/редактирование)
  const handleTeacherSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name") as string,
      position: selectedPosition || editingTeacher?.position || "", // Используем selectedPosition или текущую позицию редактируемого преподавателя
      subject: formData.get("subject") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      office: formData.get("office") as string,
      schedule: formData.get("schedule") as string,
      experience: formData.get("experience") as string,
      degree: formData.get("degree") as string,
      avatar: formData.get("avatar") as string,
    }

    // Валидация обязательных полей
    if (!data.name || !data.position) {
      toast.error("Заполните все обязательные поля (ФИО, Должность)")
      return
    }

    if (isSubjectRequired(data.position) && !data.subject) {
      toast.error("Для данной должности предмет является обязательным")
      return
    }

    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : "/api/teachers"
      const method = editingTeacher ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editingTeacher ? "Преподаватель обновлен" : "Преподаватель добавлен")
        setIsTeacherDialogOpen(false)
        setEditingTeacher(null)
        setSelectedPosition(editingTeacher ? editingTeacher.position : "Куратор группы") // Сброс или установка дефолта
        fetchData() // Обновляем список данных
      } else {
        toast.error(result.error || "Ошибка при сохранении преподавателя")
      }
    } catch (error) {
      console.error("Error saving teacher:", error)
      toast.error("Ошибка при сохранении преподавателя")
    }
  }

  // Обработчик отправки формы для студента (добавление/редактирование)
  const handleStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name") as string,
      position: selectedStudentPosition || editingStudent?.position || "",
      responsibility: formData.get("responsibility") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      telegram: formData.get("telegram") as string,
      avatar: formData.get("avatar") as string,
      year: selectedStudentYear || editingStudent?.year || "",
      gpa: formData.get("gpa") as string,
    }

    // Валидация обязательных полей
    if (!data.name || !data.position || !data.responsibility || !data.year) {
      toast.error("Заполните все обязательные поля (ФИО, Должность, Обязанности, Курс)")
      return
    }

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students"
      const method = editingStudent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editingStudent ? "Студент обновлен" : "Студент добавлен")
        setIsStudentDialogOpen(false)
        setEditingStudent(null)
        setSelectedStudentPosition(editingStudent ? editingStudent.position : "Староста группы") // Сброс или установка дефолта
        setSelectedStudentYear(editingStudent ? editingStudent.year : "1 курс") // Сброс или установка дефолта
        fetchData() // Обновляем список данных
      } else {
        toast.error(result.error || "Ошибка при сохранении студента")
      }
    } catch (error) {
      console.error("Error saving student:", error)
      toast.error("Ошибка при сохранении студента")
    }
  }

  // Обработчик удаления преподавателя
  const handleDeleteTeacher = async (id: number) => {
    try {
      const response = await fetch(`/api/teachers/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Преподаватель удален")
        fetchData() // Обновляем список данных
      } else {
        const result = await response.json().catch(() => ({ error: "Ошибка при удалении преподавателя" }))
        toast.error(result.error || "Ошибка при удалении преподавателя")
      }
    } catch (error) {
      console.error("Error deleting teacher:", error)
      toast.error("Ошибка при удалении преподавателя")
    }
  }

  // Обработчик удаления студента
  const handleDeleteStudent = async (id: number) => {
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Студент удален")
        fetchData() // Обновляем список данных
      } else {
        const result = await response.json().catch(() => ({ error: "Ошибка при удалении студента" }))
        toast.error(result.error || "Ошибка при удалении студента")
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Ошибка при удалении студента")
    }
  }

  // Конфигурация отображения для разных должностей преподавателей
  const getTeacherPositionConfig = (position: string) => {
    switch (position) {
      case "Куратор группы":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 gap-1">
              <Crown className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Crown className="h-4 w-4 text-purple-100" />, // Увеличен размер и изменен цвет для лучшей видимости
          borderColor: "border-l-purple-500",
        }
      case "Профессор":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 gap-1">
              <Award className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Award className="h-4 w-4 text-blue-100" />,
          borderColor: "border-l-blue-500",
        }
      case "Доцент":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 gap-1">
              <GraduationCap className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <GraduationCap className="h-4 w-4 text-green-100" />,
          borderColor: "border-l-green-500",
        }
      case "Преподаватель":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 gap-1">
              <BookOpen className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <BookOpen className="h-4 w-4 text-teal-100" />,
          borderColor: "border-l-teal-500",
        }
      case "Заведующий кафедрой":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 gap-1">
              <Building className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Building className="h-4 w-4 text-indigo-100" />,
          borderColor: "border-l-indigo-500",
        }
      case "Декан":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 gap-1">
              <Shield className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Shield className="h-4 w-4 text-red-100" />,
          borderColor: "border-l-red-500",
        }
      case "Проректор":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 gap-1">
              <Zap className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Zap className="h-4 w-4 text-orange-100" />,
          borderColor: "border-l-orange-500",
        }
      case "Ректор":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 gap-1">
              <Crown className="h-3 w-3" /> {/* Можно использовать другую иконку для ректора, если Crown уже занят */}
              {position}
            </Badge>
          ),
          icon: <Crown className="h-4 w-4 text-pink-100" />,
          borderColor: "border-l-pink-500",
        }
      default:
        return {
          badge: (
            <Badge variant="secondary" className="gap-1">
              <UserCheck className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <UserCheck className="h-4 w-4 text-gray-100" />, // Изменен цвет для контраста
          borderColor: "border-l-gray-400",
        }
    }
  }
    // Конфигурация отображения для разных должностей студентов
  const getStudentPositionConfig = (position: string) => {
    switch (position) {
      case "Староста группы":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 gap-1">
              <Star className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Star className="h-4 w-4 text-amber-100" />,
          borderColor: "border-l-amber-500",
        }
      case "Заместитель старосты":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 gap-1">
              <Users2 className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Users2 className="h-4 w-4 text-yellow-100" />,
          borderColor: "border-l-yellow-500",
        }
      case "Ответственный за спорт":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 gap-1">
              <Gamepad2 className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Gamepad2 className="h-4 w-4 text-emerald-100" />,
          borderColor: "border-l-emerald-500",
        }
      case "Ответственная за культуру":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 gap-1">
              <Palette className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Palette className="h-4 w-4 text-pink-100" />,
          borderColor: "border-l-pink-500",
        }
      case "Ответственный за IT":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 gap-1">
              <Code className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Code className="h-4 w-4 text-blue-100" />,
          borderColor: "border-l-blue-500",
        }
      case "Ответственная за медиа":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 gap-1">
              <Camera className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Camera className="h-4 w-4 text-purple-100" />,
          borderColor: "border-l-purple-500",
        }
      case "Профорг":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 gap-1">
              <Megaphone className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <Megaphone className="h-4 w-4 text-red-100" />,
          borderColor: "border-l-red-500",
        }
      default:
        return {
          badge: (
            <Badge variant="default" className="gap-1">
              <User className="h-3 w-3" />
              {position}
            </Badge>
          ),
          icon: <User className="h-4 w-4 text-primary-foreground" />, // Для лучшего контраста с Badge default
          borderColor: "border-l-primary",
        }
    }
  }

  // Проверка, является ли поле "Предмет" обязательным для данной должности
  const isSubjectRequired = (position: string) => {
    return !["Куратор группы", "Заведующий кафедрой", "Декан", "Проректор", "Ректор"].includes(position)
  }

  // Открытие диалогового окна для добавления/редактирования преподавателя
  const openTeacherDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher)
      setSelectedPosition(teacher.position)
    } else {
      setEditingTeacher(null)
      setSelectedPosition("Куратор группы") // ИЗМЕНЕНО: Установка значения по умолчанию для нового преподавателя
    }
    setIsTeacherDialogOpen(true)
  }

  // Открытие диалогового окна для добавления/редактирования студента
  const openStudentDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student)
      setSelectedStudentPosition(student.position)
      setSelectedStudentYear(student.year)
    } else {
      setEditingStudent(null)
      setSelectedStudentPosition("Староста группы") // ИЗМЕНЕНО: Установка значения по умолчанию
      setSelectedStudentYear("1 курс") // ИЗМЕНЕНО: Установка значения по умолчанию
    }
    setIsStudentDialogOpen(true)
  }

  // Фильтрация преподавателей по поисковому запросу и должности
  const filteredTeachers = teachers.filter((teacher) => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTermLower) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(searchTermLower)) ||
      teacher.email.toLowerCase().includes(searchTermLower)
    const matchesFilter = filterPosition === "all" || teacher.position === filterPosition
    return matchesSearch && matchesFilter
  })

  // Фильтрация студентов по поисковому запросу
  const filteredStudents = students.filter((student) => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch =
      student.name.toLowerCase().includes(searchTermLower) ||
      student.position.toLowerCase().includes(searchTermLower) ||
      student.email.toLowerCase().includes(searchTermLower)
    return matchesSearch
  })

  // Получение уникальных должностей преподавателей для фильтра
  const teacherPositions = [...new Set(teachers.map((t) => t.position))]

  // Рендеринг компонента
  return (
    <div className="space-y-6 p-4 md:p-6"> {/* Добавлены отступы для лучшего вида */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Управление контактами</h2>
          <p className="text-muted-foreground">Управление преподавателями и студенческим активом</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80"> {/* Убрана фиксированная ширина для мобильных */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск..." // Сокращен placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="teachers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teachers" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Преподаватели ({filteredTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Студенты ({filteredStudents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"> {/* Растягивание на мобильных */}
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="w-full sm:w-56"> {/* Увеличена ширина для лучшего отображения */}
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Фильтр по должности" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все должности</SelectItem>
                  {teacherPositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openTeacherDialog()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить преподавателя
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Уменьшена ширина для лучшего вида */}
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editingTeacher ? "Редактировать преподавателя" : "Добавить преподавателя"}
                  </DialogTitle>
                  <DialogDescription>Заполните информацию о преподавателе</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTeacherSubmit} className="space-y-6 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Основная информация</h3>
                      <div>
                        <Label htmlFor="teacher-name">ФИО *</Label> {/* Уникальный ID */}
                        <Input id="teacher-name" name="name" defaultValue={editingTeacher?.name} required />
                      </div>
                      <div>
                        <Label htmlFor="teacher-position">Должность *</Label> {/* Уникальный ID */}
                        <Select value={selectedPosition} onValueChange={setSelectedPosition} required>
                          <SelectTrigger id="teacher-position">
                            <SelectValue placeholder="Выберите должность" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Куратор группы">Куратор группы</SelectItem>
                            <SelectItem value="Преподаватель">Преподаватель</SelectItem>
                            <SelectItem value="Доцент">Доцент</SelectItem>
                            <SelectItem value="Профессор">Профессор</SelectItem>
                            <SelectItem value="Заведующий кафедрой">Заведующий кафедрой</SelectItem>
                            <SelectItem value="Декан">Декан</SelectItem>
                            <SelectItem value="Проректор">Проректор</SelectItem>
                            <SelectItem value="Ректор">Ректор</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="teacher-subject">
                          Предмет{" "}
                          {isSubjectRequired(selectedPosition || editingTeacher?.position || "")
                            ? "*"
                            : "(необязательно)"}
                        </Label>
                        <Input
                          id="teacher-subject" // Уникальный ID
                          name="subject"
                          defaultValue={editingTeacher?.subject}
                          placeholder={
                            isSubjectRequired(selectedPosition || editingTeacher?.position || "")
                              ? "Введите предмет"
                              : "Не ведет предметы"
                          }
                          required={isSubjectRequired(selectedPosition || editingTeacher?.position || "")} // Добавлено required
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacher-degree">Ученая степень</Label> {/* Уникальный ID */}
                        <Input
                          id="teacher-degree"
                          name="degree"
                          defaultValue={editingTeacher?.degree}
                          placeholder="к.т.н., д.т.н., и т.д."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Контактная информация</h3>
                      <div>
                        <Label htmlFor="teacher-email">Email</Label> {/* Уникальный ID */}
                        <Input id="teacher-email" name="email" type="email" defaultValue={editingTeacher?.email} />
                      </div>
                      <div>
                        <Label htmlFor="teacher-phone">Телефон</Label> {/* Уникальный ID */}
                        <Input id="teacher-phone" name="phone" defaultValue={editingTeacher?.phone} />
                      </div>
                      <div>
                        <Label htmlFor="teacher-office">Кабинет</Label> {/* Уникальный ID */}
                        <Input
                          id="teacher-office"
                          name="office"
                          defaultValue={editingTeacher?.office}
                          placeholder="Номер кабинета"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacher-schedule">Расписание приема</Label> {/* Уникальный ID */}
                        <Input
                          id="teacher-schedule"
                          name="schedule"
                          defaultValue={editingTeacher?.schedule}
                          placeholder="Пн-Пт 9:00-16:00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Дополнительная информация</h3>
                    <div>
                      <Label htmlFor="teacher-experience">Опыт работы</Label> {/* Уникальный ID */}
                      <Textarea
                        id="teacher-experience"
                        name="experience"
                        defaultValue={editingTeacher?.experience}
                        placeholder="Краткое описание опыта работы"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher-avatar">URL аватара</Label> {/* Уникальный ID */}
                      <Input
                        id="teacher-avatar"
                        name="avatar"
                        defaultValue={editingTeacher?.avatar}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTeacherDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">{editingTeacher ? "Обновить" : "Добавить"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading && <p>Загрузка преподавателей...</p>}
          {!isLoading && filteredTeachers.length === 0 && <p>Преподаватели не найдены.</p>}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"> {/* Адаптивная сетка */}
            {filteredTeachers.map((teacher) => {
              const config = getTeacherPositionConfig(teacher.position)
              return (
                <Card
                  key={teacher.id}
                  className={`hover:shadow-xl transition-all duration-300 ease-in-out border-l-4 ${config.borderColor} flex flex-col`} // flex-col для равной высоты
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-16 h-16 ring-2 ring-background shadow-md">
                          <AvatarImage src={teacher.avatar || `https://placehold.co/64x64/E2E8F0/4A5568?text=${teacher.name.charAt(0)}`} alt={teacher.name} />
                          <AvatarFallback className="text-lg font-semibold">
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 ${config.borderColor.replace('border-l-', 'bg-')} rounded-full flex items-center justify-center shadow-sm border-2 border-card`}>
                          {config.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5"> {/* Уменьшен интервал */}
                            <h4 className="text-lg font-semibold leading-tight">{teacher.name}</h4> {/* Уменьшена высота строки */}
                            <div className="flex flex-wrap gap-1.5"> {/* Уменьшен gap */}
                              {config.badge}
                              {teacher.subject && <Badge variant="outline" className="text-xs px-1.5 py-0.5">{teacher.subject}</Badge>}
                              {teacher.degree && <Badge variant="soft" className="text-xs px-1.5 py-0.5">{teacher.degree}</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="icon" variant="outline" onClick={() => openTeacherDialog(teacher)} className="w-8 h-8"> {/* Кнопки-иконки */}
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="outline" className="w-8 h-8 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Удалить преподавателя?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это действие нельзя отменить. Преподаватель {teacher.name} будет удален.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTeacher(teacher.id)} className="bg-destructive hover:bg-destructive/90">
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex-grow"> {/* pt-2 и flex-grow */}
                    <div className="space-y-2 text-sm"> {/* Уменьшен интервал */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a href={`mailto:${teacher.email}`} className="truncate hover:underline">{teacher.email}</a>
                        </div>
                      {teacher.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                      {teacher.office && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>Каб. {teacher.office}</span>
                        </div>
                      )}
                      {teacher.schedule && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{teacher.schedule}</span>
                        </div>
                      )}
                    </div>
                    {teacher.experience && (
                      <div className="mt-3 p-2.5 bg-muted/50 rounded-md"> {/* Уменьшены отступы */}
                        <p className="text-xs text-muted-foreground leading-snug">{teacher.experience}</p> {/* Уменьшен размер и высота строки */}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <h3 className="text-xl font-semibold">Студенческий актив</h3> {/* Увеличен размер шрифта */}
            <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openStudentDialog()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить студента
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"> {/* Уменьшена ширина */}
                <DialogHeader>
                  <DialogTitle className="text-xl">{editingStudent ? "Редактировать студента" : "Добавить студента"}</DialogTitle>
                  <DialogDescription>Заполните информацию о студенте</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleStudentSubmit} className="space-y-4 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-name-form">ФИО *</Label> {/* Уникальный ID */}
                      <Input id="student-name-form" name="name" defaultValue={editingStudent?.name} required />
                    </div>
                    <div>
                      <Label htmlFor="student-position-form">Должность *</Label> {/* Уникальный ID */}
                      <Select value={selectedStudentPosition} onValueChange={setSelectedStudentPosition} required>
                        <SelectTrigger id="student-position-form">
                          <SelectValue placeholder="Выберите должность" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Староста группы">Староста группы</SelectItem>
                          <SelectItem value="Заместитель старосты">Заместитель старосты</SelectItem>
                          <SelectItem value="Ответственный за спорт">Ответственный за спорт</SelectItem>
                          <SelectItem value="Ответственная за культуру">Ответственная за культуру</SelectItem>
                          <SelectItem value="Ответственный за IT">Ответственный за IT</SelectItem>
                          <SelectItem value="Ответственная за медиа">Ответственная за медиа</SelectItem>
                          <SelectItem value="Профорг">Профорг</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="student-responsibility">Обязанности *</Label> {/* Уникальный ID */}
                    <Textarea
                      id="student-responsibility"
                      name="responsibility"
                      defaultValue={editingStudent?.responsibility}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-email-form">Email</Label> {/* Уникальный ID */}
                      <Input id="student-email-form" name="email" type="email" defaultValue={editingStudent?.email} />
                    </div>
                    <div>
                      <Label htmlFor="student-phone-form">Телефон</Label> {/* Уникальный ID */}
                      <Input id="student-phone-form" name="phone" defaultValue={editingStudent?.phone} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-telegram">Telegram</Label> {/* Уникальный ID */}
                      <Input
                        id="student-telegram"
                        name="telegram"
                        defaultValue={editingStudent?.telegram}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="student-year">Курс *</Label> {/* Уникальный ID */}
                      <Select value={selectedStudentYear} onValueChange={setSelectedStudentYear} required>
                        <SelectTrigger id="student-year">
                          <SelectValue placeholder="Выберите курс" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 курс">1 курс</SelectItem>
                          <SelectItem value="2 курс">2 курс</SelectItem>
                          <SelectItem value="3 курс">3 курс</SelectItem>
                          <SelectItem value="4 курс">4 курс</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-gpa">Средний балл</Label> {/* Уникальный ID */}
                      <Input id="student-gpa" name="gpa" defaultValue={editingStudent?.gpa} placeholder="4.8" />
                    </div>
                    <div>
                      <Label htmlFor="student-avatar-form">URL аватара</Label> {/* Уникальный ID */}
                      <Input
                        id="student-avatar-form"
                        name="avatar"
                        defaultValue={editingStudent?.avatar}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsStudentDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">{editingStudent ? "Обновить" : "Добавить"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {isLoading && <p>Загрузка студентов...</p>}
          {!isLoading && filteredStudents.length === 0 && <p>Студенты не найдены.</p>}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"> {/* Адаптивная сетка */}
            {filteredStudents.map((student) => {
              const config = getStudentPositionConfig(student.position)
              return (
                <Card
                  key={student.id}
                  className={`hover:shadow-xl transition-all duration-300 ease-in-out border-l-4 ${config.borderColor} flex flex-col`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-16 h-16 ring-2 ring-background shadow-md">
                           <AvatarImage src={student.avatar || `https://placehold.co/64x64/E2E8F0/4A5568?text=${student.name.charAt(0)}`} alt={student.name} />
                          <AvatarFallback className="text-lg font-semibold">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                         <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 ${config.borderColor.replace('border-l-', 'bg-')} rounded-full flex items-center justify-center shadow-sm border-2 border-card`}>
                          {config.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <h4 className="text-lg font-semibold leading-tight">{student.name}</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {config.badge}
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">{student.year}</Badge>
                              {student.gpa && <Badge variant="soft" className="text-xs px-1.5 py-0.5">GPA: {student.gpa}</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="icon" variant="outline" onClick={() => openStudentDialog(student)} className="w-8 h-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="outline" className="w-8 h-8 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Удалить студента?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это действие нельзя отменить. Студент {student.name} будет удален.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-destructive hover:bg-destructive/90">
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex-grow">
                    <p className="text-xs text-muted-foreground mb-3 bg-muted/50 p-2.5 rounded-md leading-snug"> {/* Уменьшены отступы и размер */}
                      {student.responsibility}
                    </p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a href={`mailto:${student.email}`} className="truncate hover:underline">{student.email}</a>
                        </div>
                      {student.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.telegram && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MessageCircle className="h-4 w-4 flex-shrink-0" />
                           <a href={`https://t.me/${student.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{student.telegram}</a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}