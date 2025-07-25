"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExamsList } from "@/components/exams-list"
import { useAuth } from "@/contexts/auth-context"
import { GraduationCap, Clock, Lightbulb, Calendar, BookOpen, AlertCircle, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExamsPage() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("exams")

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Экзамены</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/40 rounded-lg p-1">
          <TabsTrigger
            value="exams"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <GraduationCap className="h-4 w-4" />
            Экзамены
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Info className="h-4 w-4" />
            Информация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="pt-4 animate-fadeIn">
          <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Все экзамены
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Полный список экзаменов по всем неделям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExamsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="pt-4 animate-fadeIn">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  Статусы экзаменов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="status-indicator bg-red-500"></div>
                    <span>Экзамен сегодня или завтра</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="status-indicator bg-orange-500"></div>
                    <span>Экзамен через 2-3 дня</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="status-indicator bg-green-600"></div>
                    <span>Экзамен через 4+ дней</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                    <div className="status-indicator bg-gray-500"></div>
                    <span>Экзамен завершен</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  Подготовка к экзаменам
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-3">Для успешной сдачи экзаменов рекомендуется:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                      1
                    </span>
                    <span>Начать подготовку заранее (минимум за 2 недели)</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                      2
                    </span>
                    <span>Составить план подготовки по темам</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                      3
                    </span>
                    <span>Повторять материал регулярно, а не в последний день</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                      4
                    </span>
                    <span>Решать практические задания из материалов экзамена</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                      5
                    </span>
                    <span>Высыпаться перед экзаменом и не забыть документы</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-white/10 overflow-hidden transition-all duration-300 bg-card/30 backdrop-blur-md rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                Правила проведения экзаменов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-primary">
                  <h3 className="font-medium mb-1">Документы</h3>
                  <p className="text-muted-foreground">
                    На экзамен необходимо принести студенческий билет или зачетную книжку.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-yellow-500">
                  <h3 className="font-medium mb-1">Запрещенные предметы</h3>
                  <p className="text-muted-foreground">
                    Во время экзамена запрещено пользоваться мобильными телефонами, шпаргалками и другими неразрешенными
                    материалами.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-red-500">
                  <h3 className="font-medium mb-1">Опоздания</h3>
                  <p className="text-muted-foreground">
                    Студенты, опоздавшие более чем на 15 минут, могут быть не допущены к экзамену.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30 border-l-4 border-green-500">
                  <h3 className="font-medium mb-1">Пересдача</h3>
                  <p className="text-muted-foreground">
                    В случае неудовлетворительной оценки, пересдача возможна в установленные сроки.
                  </p>
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
                Часто задаваемые вопросы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background/30">
                  <h3 className="font-medium mb-1">Что делать, если я заболел перед экзаменом?</h3>
                  <p className="text-sm text-muted-foreground">
                    Необходимо сообщить об этом в деканат и предоставить медицинскую справку. Вам будет назначена
                    индивидуальная дата сдачи экзамена.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30">
                  <h3 className="font-medium mb-1">Можно ли пользоваться калькулятором на экзамене?</h3>
                  <p className="text-sm text-muted-foreground">
                    Это зависит от требований преподавателя. Обычно простые калькуляторы разрешены на технических
                    экзаменах, но программируемые калькуляторы запрещены.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/30">
                  <h3 className="font-medium mb-1">Сколько времени дается на подготовку к ответу?</h3>
                  <p className="text-sm text-muted-foreground">
                    Обычно на подготовку дается 30-45 минут, но это может варьироваться в зависимости от сложности
                    предмета и формата экзамена.
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