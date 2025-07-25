"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Users,
  GraduationCap,
  BookOpen,
  Star,
  UserCheck,
  Megaphone,
  Monitor,
  Camera,
  Palette,
  Trophy,
  Send,
} from "lucide-react"

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
  isActive: boolean
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

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState("teachers")
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [teachersRes, studentsRes] = await Promise.all([fetch("/api/teachers"), fetch("/api/students")])

        if (teachersRes.ok) {
          setTeachers(await teachersRes.json())
        }

        if (studentsRes.ok) {
          setStudents(await studentsRes.json())
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Ошибка при загрузке данных")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPosition = positionFilter === "all" || teacher.position === positionFilter

    return matchesSearch && matchesPosition
  })

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.responsibility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPosition = positionFilter === "all" || student.position === positionFilter

    return matchesSearch && matchesPosition
  })

  const teacherPositions = [...new Set(teachers.map((t) => t.position))]
  const studentPositions = [...new Set(students.map((s) => s.position))]
  const allPositions = activeTab === "teachers" ? teacherPositions : studentPositions

  const LoadingSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const getTeacherIcon = (position: string) => {
    switch (position) {
      case "Куратор группы":
        return <Star className="h-4 w-4" />
      case "Профессор":
        return <GraduationCap className="h-4 w-4" />
      case "Доцент":
        return <BookOpen className="h-4 w-4" />
      case "Преподаватель":
        return <Users className="h-4 w-4" />
      case "Заведующий кафедрой":
        return <Building className="h-4 w-4" />
      case "Декан":
        return <UserCheck className="h-4 w-4" />
      case "Проректор":
        return <Star className="h-4 w-4" />
      case "Ректор":
        return <GraduationCap className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getStudentIcon = (position: string) => {
    switch (position) {
      case "Староста группы":
      case "Староста":
        return <Star className="h-4 w-4" />
      case "Заместитель старосты":
        return <UserCheck className="h-4 w-4" />
      case "Профорг":
        return <Megaphone className="h-4 w-4" />
      case "Ответственный за IT":
      case "Отв. за IT":
        return <Monitor className="h-4 w-4" />
      case "Ответственная за медиа":
      case "Ответственный за медиа":
      case "Отв. за медиа":
        return <Camera className="h-4 w-4" />
      case "Ответственная за культуру":
      case "Ответственный за культуру":
      case "Отв. за культуру":
        return <Palette className="h-4 w-4" />
      case "Ответственный за спорт":
      case "Отв. за спорт":
        return <Trophy className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getPositionColor = (position: string, isTeacher: boolean) => {
    if (isTeacher) {
      switch (position) {
        case "Куратор группы":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        case "Профессор":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "Доцент":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "Преподаватель":
          return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
        case "Заведующий кафедрой":
          return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
        case "Декан":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        case "Проректор":
          return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        case "Ректор":
          return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      }
    } else {
      switch (position) {
        case "Староста группы":
        case "Староста":
          return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        case "Заместитель старосты":
          return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        case "Профорг":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        case "Ответственный за IT":
        case "Отв. за IT":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "Ответственная за медиа":
        case "Ответственный за медиа":
        case "Отв. за медиа":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        case "Ответственная за культуру":
        case "Ответственный за культуру":
        case "Отв. за культуру":
          return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
        case "Ответственный за спорт":
        case "Отв. за спорт":
          return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Контакты группы</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Преподаватели и активисты нашей дружной группы</p>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, предмету, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="sm:w-[250px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Все должности" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все должности</SelectItem>
                {allPositions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Табы */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Преподаватели</span>
            <span className="sm:hidden">Препод.</span>
            <Badge variant="secondary" className="ml-1">
              {teachers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Студенческий актив</span>
            <span className="sm:hidden">Актив</span>
            <Badge variant="secondary" className="ml-1">
              {students.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Преподаватели */}
        <TabsContent value="teachers" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={teacher.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{teacher.name}</h3>
                        <Badge variant="outline" className={`text-xs ${getPositionColor(teacher.position, true)}`}>
                          <span className="mr-1">{getTeacherIcon(teacher.position)}</span>
                          {teacher.position}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <BookOpen className="h-4 w-4" />
                          {teacher.subject}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${teacher.email}`} className="text-primary hover:underline truncate">
                            {teacher.email}
                          </a>
                        </div>

                        {teacher.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${teacher.phone}`} className="hover:text-primary">
                              {teacher.phone}
                            </a>
                          </div>
                        )}

                        {teacher.office && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>Каб. {teacher.office}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button size="sm" className="w-full mt-4">
                      <Mail className="h-4 w-4 mr-2" />
                      Написать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredTeachers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Преподаватели не найдены</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Студенческий актив */}
        <TabsContent value="students" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold mb-2">{student.name}</h3>
                      <Badge className={`${getPositionColor(student.position, false)}`}>
                        <span className="mr-1">{getStudentIcon(student.position)}</span>
                        {student.position}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Обязанности:</p>
                        <p className="text-sm">{student.responsibility}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${student.email}`} className="text-primary hover:underline truncate">
                            {student.email}
                          </a>
                        </div>

                        {student.telegram && (
                          <div className="flex items-center gap-2 text-sm">
                            <Send className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`https://t.me/${student.telegram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              @{student.telegram}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      {student.telegram && (
                        <Button size="sm" className="flex-1" asChild>
                          <a href={`https://t.me/${student.telegram}`} target="_blank" rel="noopener noreferrer">
                            <Send className="h-4 w-4 mr-1" />
                            Telegram
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredStudents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Студенты не найдены</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Статистика */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-center">Статистика группы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{teachers.length}</div>
              <div className="text-sm text-muted-foreground">Преподавателей</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{students.length}</div>
              <div className="text-sm text-muted-foreground">Активистов</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">25</div>
              <div className="text-sm text-muted-foreground">Студентов</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">4.6</div>
              <div className="text-sm text-muted-foreground">Средний балл</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}