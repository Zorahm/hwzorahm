"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react"

// Interfaces remain unchanged
interface HomeworkFile {
  id: number
  filename: string
  fileUrl: string
  homeworkId: number
}

interface Homework {
  id: number
  weekId: number
  subject: string
  description: string
  shortDescription: string | null
  detailedDescription: string | null
  deadline: string
  fileUrl: string | null
  files: HomeworkFile[]
  scheduleId: number | null
  schedule?: {
    id: number
    day: string
    slot: number
    customTime: boolean
    startTime: string | null
    endTime: string | null
  } | null
}

interface HomeworkListProps {
  weekId?: number
  limit?: number
}

export function HomeworkList({ weekId, limit }: HomeworkListProps) {
  // All state and logic hooks are preserved
  const [homeworkData, setHomeworkData] = useState<Homework[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [sortByDeadline, setSortByDeadline] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("active")
  const { toast } = useToast()

  // Data fetching logic is preserved
  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setIsLoading(true)
        const url = weekId ? `/api/homework?weekId=${weekId}` : "/api/homework"
        const response = await fetch(url)
        if (!response.ok) throw new Error("Ошибка при загрузке домашних заданий")
        
        const data = await response.json()
        
        const homeworksWithSchedule = await Promise.all(
          data.map(async (hw: Homework) => {
            if (hw.scheduleId) {
              try {
                const scheduleResponse = await fetch(`/api/schedule/${hw.scheduleId}`)
                if (scheduleResponse.ok) {
                  const scheduleData = await scheduleResponse.json()
                  return { ...hw, schedule: scheduleData }
                }
              } catch (error) {
                console.error(`Error fetching schedule for homework ${hw.id}:`, error)
              }
            }
            return hw
          })
        )

        setHomeworkData(homeworksWithSchedule)
        const uniqueSubjects = [...new Set(data.map((hw: Homework) => hw.subject))]
        setSubjects(uniqueSubjects)
      } catch (error) {
        console.error("Error fetching homework:", error)
        toast({ title: "Ошибка", description: "Не удалось загрузить домашние задания", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchHomework()
  }, [weekId, toast])

  const getDaysLeft = (deadlineString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineString);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Memoized filtering logic is preserved
  const filteredHomework = useMemo(() => {
    let result = [...homeworkData]
    if (filter) {
      result = result.filter((hw) => hw.subject === filter)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (hw) =>
          hw.subject.toLowerCase().includes(query) ||
          hw.description.toLowerCase().includes(query) ||
          (hw.shortDescription && hw.shortDescription.toLowerCase().includes(query)) ||
          (hw.detailedDescription && hw.detailedDescription.toLowerCase().includes(query))
      )
    }
    if (activeTab === "active") {
      result = result.filter((hw) => getDaysLeft(hw.deadline) >= 0)
    } else if (activeTab === "expired") {
      result = result.filter((hw) => getDaysLeft(hw.deadline) < 0)
    }
    if (sortByDeadline) {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    } else {
      result.sort((a, b) => a.subject.localeCompare(b.subject))
    }
    if (limit && result.length > limit) {
      result = result.slice(0, limit)
    }
    return result
  }, [homeworkData, filter, searchQuery, activeTab, sortByDeadline, limit])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: 'numeric', hour: "2-digit", minute: "2-digit" }).format(date)
  }

  // Redesigned deadline badges
  const getDeadlineBadge = (deadlineString: string) => {
    const daysLeft = getDaysLeft(deadlineString)
    if (daysLeft < 0) {
      return <Badge variant="outline" className="border-red-500 bg-red-500/10 text-red-400 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" />Просрочено</Badge>
    } else if (daysLeft === 0) {
      return <Badge variant="outline" className="border-red-500 bg-red-500/10 text-red-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Сегодня</Badge>
    } else if (daysLeft === 1) {
      return <Badge variant="outline" className="border-orange-500 bg-orange-500/10 text-orange-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Завтра</Badge>
    } else if (daysLeft <= 3) {
      return <Badge variant="outline" className="border-yellow-500 bg-yellow-500/10 text-yellow-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Скоро</Badge>
    } else {
      return <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Есть время</Badge>
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const getTimeBySlot = (slot: number): string => {
    switch (slot) {
      case 0: return "8:30–10:00"
      case 1: return "10:10–11:40"
      case 2: return "11:50–13:20"
      case 3: return "13:50–15:20"
      case 4: return "15:30–17:00"
      case 5: return "17:10–18:40"
      default: return ""
    }
  }

  // Redesigned loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-400">Загрузка домашних заданий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-gray-200">
      {/* Redesigned search and filter panel with improved responsiveness */}
      <Card className="bg-[#2D2D3A] border-gray-700/50 rounded-xl">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Поиск по домашним заданиям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#3a3a4a] border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-3 md:w-auto bg-[#3a3a4a] rounded-lg p-1 border border-gray-700/50">
                <TabsTrigger value="all" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Все</TabsTrigger>
                <TabsTrigger value="active" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Актуальные</TabsTrigger>
                <TabsTrigger value="expired" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Просроченные</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[#3a3a4a] border-gray-600 text-gray-300 hover:bg-[#454555] hover:text-white flex-1 md:flex-none w-full md:w-auto justify-center">
                    <Filter className="h-4 w-4 mr-2" />
                    {filter || "Все предметы"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2D2D3A] border-gray-700 text-gray-200">
                  <DropdownMenuItem onClick={() => setFilter(null)} className="hover:bg-[#3a3a4a] focus:bg-[#3a3a4a]">Все предметы</DropdownMenuItem>
                  {subjects.map((subject) => (
                    <DropdownMenuItem key={subject} onClick={() => setFilter(subject)} className="hover:bg-[#3a3a4a] focus:bg-[#3a3a4a]">{subject}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="bg-[#3a3a4a] border-gray-600 text-gray-300 hover:bg-[#454555] hover:text-white flex-1 md:flex-none w-full md:w-auto justify-center" onClick={() => setSortByDeadline(!sortByDeadline)}>
                {sortByDeadline ? <><Calendar className="h-4 w-4 mr-2" />По дедлайну</> : <><BookOpen className="h-4 w-4 mr-2" />По предмету</>}
              </Button>
               <Badge variant="secondary" className="bg-[#3a3a4a] text-gray-300 border-gray-600 h-10 hidden lg:flex">
                 Найдено: {filteredHomework.length}
               </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redesigned homework list */}
      <div className="space-y-4">
        {filteredHomework.length > 0 ? (
          filteredHomework.map((homework) => {
            const isExpanded = expandedItems.includes(homework.id)
            const daysLeft = getDaysLeft(homework.deadline)
            const borderColor = daysLeft < 0 ? 'border-l-red-500' : daysLeft <= 3 ? 'border-l-orange-500' : 'border-l-green-500';

            return (
              <Card key={homework.id} className={`bg-[#2D2D3A] border-gray-700/50 rounded-xl border-l-4 ${borderColor} transition-all duration-300`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                         <h3 className="font-semibold text-lg text-white">{homework.subject}</h3>
                         <div className="sm:hidden">{getDeadlineBadge(homework.deadline)}</div>
                      </div>
                      
                      {homework.schedule && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <CalendarDays className="h-4 w-4" />
                          <span>{homework.schedule.day}</span>
                          <span className="text-gray-600">•</span>
                          <Clock className="h-4 w-4" />
                          <span>{homework.schedule.customTime && homework.schedule.startTime ? `${homework.schedule.startTime}–${homework.schedule.endTime}` : getTimeBySlot(homework.schedule.slot)}</span>
                        </div>
                      )}
                      <p className="text-gray-300 leading-relaxed text-sm">{homework.shortDescription || homework.description}</p>
                    </div>

                    <div className="hidden sm:flex flex-col items-end justify-start gap-2 min-w-[150px]">
                      {getDeadlineBadge(homework.deadline)}
                      <div className="text-right text-sm">
                        <div className="font-medium text-white">{formatDate(homework.deadline)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(homework.id)} className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                      {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                      {isExpanded ? "Свернуть" : "Подробнее"}
                    </Button>
                    
                    {homework.detailedDescription && (
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-white/5 hover:text-white"><FileText className="h-4 w-4 mr-2" />Полное описание</Button>
                         </DialogTrigger>
                         <DialogContent className="bg-[#2D2D3A] border-gray-700 text-gray-200 max-w-3xl max-h-[90vh] flex flex-col">
                           <DialogHeader><DialogTitle className="flex items-center gap-2 text-white"><BookOpen className="h-5 w-5 text-blue-500" />{homework.subject}</DialogTitle></DialogHeader>
                           <ScrollArea className="flex-1 my-4 pr-4 -mr-4"><div className="prose prose-sm max-w-none dark:prose-invert"><MarkdownRenderer content={homework.detailedDescription} /></div></ScrollArea>
                           <div className="flex justify-between items-center pt-4 border-t border-gray-700/50"><div className="flex items-center gap-2 text-sm text-gray-400"><Clock className="h-4 w-4" /><span>Дедлайн: {formatDate(homework.deadline)}</span></div>{getDeadlineBadge(homework.deadline)}</div>
                         </DialogContent>
                       </Dialog>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4 animate-in fade-in duration-300">
                      {homework.files && homework.files.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-white">Прикрепленные файлы:</h4>
                          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {homework.files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-600 bg-[#3a3a4a] hover:bg-[#454555] transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden"><FileText className="h-5 w-5 text-blue-400 flex-shrink-0" /><span className="text-sm font-medium truncate">{file.filename}</span></div>
                                <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white"><a href={file.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a></Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-[#2D2D3A] border-dashed border-gray-700/80 rounded-xl">
            <CardContent className="text-center py-16">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-white mb-2">Нет домашних заданий</h3>
              <p className="text-gray-400 mb-4">{searchQuery || filter ? "По заданным критериям ничего не найдено" : "Домашние задания отсутствуют"}</p>
              {(searchQuery || filter) && <Button variant="outline" className="bg-[#3a3a4a] border-gray-600 text-gray-300 hover:bg-[#454555] hover:text-white" onClick={() => {setSearchQuery(""); setFilter(null)}}>Сбросить фильтры</Button>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}