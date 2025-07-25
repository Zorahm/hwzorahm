"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WeekSelector } from "@/components/week-selector"
import { ScheduleView } from "@/components/schedule-view"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MapPin, BookOpen, Info, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SchedulePage() {
  const [selectedWeekId, setSelectedWeekId] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("schedule")
  const { isAdmin } = useAuth()

  const handleWeekChange = (weekId: number) => {
    setSelectedWeekId(weekId)
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Расписание</h1>
        </div>
        <div className="flex items-center gap-2">
          <WeekSelector onWeekChange={handleWeekChange} filter="current-future" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/40 rounded-lg p-1">
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Calendar className="h-4 w-4" />
              Расписание
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Info className="h-4 w-4" />
              Информация
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="schedule" className="pt-4 animate-fadeIn">
          <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Расписание занятий
                </CardTitle>
                <CardDescription className="text-muted-foreground">Выберите неделю в выпадающем списке</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScheduleView weekId={selectedWeekId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="pt-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  Время пар
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="font-medium">0 пара:</span>
                    <span className="text-primary font-medium">8:30–10:00</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="font-medium">1 пара:</span>
                    <span className="text-primary font-medium">10:10–11:40</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="font-medium">2 пара:</span>
                    <span className="text-primary font-medium">11:50–13:20</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="font-medium">3 пара:</span>
                    <span className="text-primary font-medium">13:50–15:20</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="font-medium">4 пара:</span>
                    <span className="text-primary font-medium">15:30–17:00</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="font-medium">5 пара:</span>
                    <span className="text-primary font-medium">17:10–18:40</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  Условные обозначения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="status-indicator bg-primary"></div>
                    <span>Изменённое время пары</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="inline-block h-2.5 w-2.5 rounded-full bg-gray-500 opacity-50"></div>
                    <span>Отменённая пара</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Кастомное время проведения</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                Типы занятий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                  <div className="status-indicator bg-blue-500"></div>
                  <span className="md:block hidden">Лекция</span>
                  <span className="md:hidden">Л</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                  <div className="status-indicator bg-green-500"></div>
                  <span className="md:block hidden">Практика</span>
                  <span className="md:hidden">П</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                  <div className="status-indicator bg-purple-500"></div>
                  <span className="md:block hidden">Лабораторная работа</span>
                  <span className="md:hidden">ЛР</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                  <div className="status-indicator bg-yellow-500"></div>
                  <span className="md:block hidden">Консультация</span>
                  <span className="md:hidden">К</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                  <div className="status-indicator bg-red-500"></div>
                  <span className="md:block hidden">Пересдача</span>
                  <span className="md:hidden">ПС</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                  <div className="status-indicator bg-orange-500"></div>
                  <span className="md:block hidden">Экзамен/Зачет</span>
                  <span className="md:hidden">Э/З</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-primary" />
                </div>
                Важная информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-primary">
                  <h3 className="font-medium mb-1">Изменения в расписании</h3>
                  <p className="text-muted-foreground">
                    Следите за обновлениями расписания. Изменения могут происходить в течение семестра.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-yellow-500">
                  <h3 className="font-medium mb-1">Посещаемость</h3>
                  <p className="text-muted-foreground">
                    Посещение занятий обязательно. В случае пропуска, необходимо предоставить оправдательный документ.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-green-500">
                  <h3 className="font-medium mb-1">Дистанционное обучение</h3>
                  <p className="text-muted-foreground">
                    В случае перехода на дистанционное обучение, ссылки на онлайн-занятия будут доступны в расписании.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
