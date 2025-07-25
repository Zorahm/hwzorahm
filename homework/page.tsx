"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WeekSelector } from "@/components/week-selector"
import { HomeworkList } from "@/components/homework-list"
import { useAuth } from "@/contexts/auth-context"
import { ClipboardList, Clock, Lightbulb, BookOpen, Calendar, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomeworkPage() {
  const [selectedWeekId, setSelectedWeekId] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("homework")
  const { isAdmin } = useAuth()

  const handleWeekChange = (weekId: number) => {
    setSelectedWeekId(weekId)
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Домашние задания</h1>
        </div>
        <div className="flex items-center gap-2">
          <WeekSelector onWeekChange={handleWeekChange} filter="current-future" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/40 rounded-lg p-1 min-w-[300px]">
            <TabsTrigger
              value="homework"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <ClipboardList className="h-4 w-4" />
              Задания
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Lightbulb className="h-4 w-4" />
              Информация
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="homework" className="pt-4 animate-fadeIn">
          <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Все домашние задания
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Используйте фильтры для поиска нужных заданий
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeworkList weekId={selectedWeekId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="pt-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  Дедлайны
                </CardTitle>
                <CardDescription>Информация о статусе дедлайнов</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-glow"></div>
                    <span>Просрочено или сдать сегодня/завтра</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-glow"></div>
                    <span>Сдать в ближайшие 3 дня</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="w-3 h-3 rounded-full bg-green-600 shadow-glow"></div>
                    <span>Есть время на выполнение</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  Советы по выполнению
                </CardTitle>
                <CardDescription>Рекомендации для эффективной работы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <span>Начинайте выполнение заранее, не откладывайте на последний день</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                    <span>Внимательно читайте задание и следуйте всем требованиям</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                    <ClipboardList className="h-4 w-4 text-primary mt-0.5" />
                    <span>Разбивайте сложные задания на части и выполняйте поэтапно</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                    <span>Задавайте вопросы преподавателю, если что-то непонятно</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                Как сдавать домашние задания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Подготовьте файлы</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Убедитесь, что ваши файлы соответствуют требованиям задания и имеют правильный формат
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Отправьте работу</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Отправьте работу через систему или на электронную почту преподавателя до указанного дедлайна
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Получите обратную связь</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      После проверки вы получите оценку и комментарии к вашей работе
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
