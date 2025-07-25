"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Archive,
  Home,
  FileText,
  Bell,
  Filter,
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Users,
  Smartphone,
  Laptop,
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold tracking-tight">О сайте</h1>
      </div>

      <Card className="border-border/40 bg-card overflow-hidden card-hover">
        <div className="bg-gradient-to-r from-primary to-[hsl(250,60%,60%)] p-5">
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Что такое этот сайт?
          </CardTitle>
        </div>
        <CardContent className="p-5">
          <div className="space-y-4">
            <p>
              Это веб-приложение разработано специально для студентов нашей группы, чтобы упростить доступ к важной
              учебной информации и помочь в организации учебного процесса.
            </p>
            <p>
              Сайт предоставляет удобный доступ к расписанию занятий, домашним заданиям, информации об экзаменах и
              другим учебным материалам в одном месте, с любого устройства и в любое время.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="features">Основные функции</TabsTrigger>
          <TabsTrigger value="usage">Как пользоваться</TabsTrigger>
          <TabsTrigger value="faq">Частые вопросы</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Дашборд
              </CardTitle>
              <CardDescription>Главная страница с обзором важной информации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Текущая неделя</h4>
                    <p className="text-sm text-muted-foreground">
                      Информация о текущей учебной неделе, включая оставшиеся учебные дни, текущую пару и следующую пару
                      по расписанию
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Ближайшие экзамены</h4>
                    <p className="text-sm text-muted-foreground">
                      Список предстоящих экзаменов с датами и временем проведения
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Расписание на неделю</h4>
                    <p className="text-sm text-muted-foreground">Краткий обзор расписания занятий на текущую неделю</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Домашние задания</h4>
                    <p className="text-sm text-muted-foreground">Список актуальных домашних заданий с дедлайнами</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Расписание
              </CardTitle>
              <CardDescription>Полное расписание занятий</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Выбор недели</h4>
                    <p className="text-sm text-muted-foreground">
                      Возможность просмотра расписания на любую неделю учебного года
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Типы занятий</h4>
                    <p className="text-sm text-muted-foreground">
                      Цветовая индикация различных типов занятий (лекции, практики, лабораторные)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Время занятий</h4>
                    <p className="text-sm text-muted-foreground">Стандартное и нестандартное время проведения пар</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Мобильный вид</h4>
                    <p className="text-sm text-muted-foreground">
                      Адаптивное отображение расписания на мобильных устройствах с вкладками по дням недели
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Домашние задания
              </CardTitle>
              <CardDescription>Управление домашними заданиями</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Filter className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Фильтрация</h4>
                    <p className="text-sm text-muted-foreground">
                      Возможность фильтрации заданий по предметам и неделям
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Дедлайны</h4>
                    <p className="text-sm text-muted-foreground">
                      Цветовая индикация статуса дедлайнов (просрочено, скоро, в срок)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Детали заданий</h4>
                    <p className="text-sm text-muted-foreground">
                      Подробное описание заданий с возможностью просмотра дополнительных материалов
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Материалы</h4>
                    <p className="text-sm text-muted-foreground">
                      Доступ к учебным материалам и файлам для выполнения заданий
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Экзамены
              </CardTitle>
              <CardDescription>Информация об экзаменах и зачетах</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Расписание экзаменов</h4>
                    <p className="text-sm text-muted-foreground">
                      Даты, время и места проведения всех экзаменов и зачетов
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Материалы для подготовки</h4>
                    <p className="text-sm text-muted-foreground">
                      Доступ к вопросам, билетам и учебным материалам для подготовки
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Статус экзаменов</h4>
                    <p className="text-sm text-muted-foreground">
                      Цветовая индикация приближающихся и прошедших экзаменов
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Требования</h4>
                    <p className="text-sm text-muted-foreground">
                      Информация о требованиях и критериях оценки для каждого экзамена
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                Архив
              </CardTitle>
              <CardDescription>Доступ к прошедшим неделям и материалам</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Прошедшие недели</h4>
                    <p className="text-sm text-muted-foreground">Доступ к информации о прошедших учебных неделях</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Архивное расписание</h4>
                    <p className="text-sm text-muted-foreground">Просмотр расписания за прошедшие периоды</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Прошедшие задания</h4>
                    <p className="text-sm text-muted-foreground">
                      История домашних заданий с возможностью доступа к материалам
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">Поиск по архиву</h4>
                    <p className="text-sm text-muted-foreground">Возможность поиска информации в архивных данных</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Начало работы
              </CardTitle>
              <CardDescription>Как начать пользоваться сайтом</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Вход в систему</h4>
                    <p className="text-sm text-muted-foreground">
                      Введите свои учетные данные (логин и пароль) на странице входа. Если у вас нет учетных данных,
                      обратитесь к старосте группы.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Ознакомьтесь с дашбордом</h4>
                    <p className="text-sm text-muted-foreground">
                      После входа вы попадете на главную страницу (дашборд), где представлена основная информация о
                      текущей неделе, ближайших экзаменах, расписании и домашних заданиях.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Используйте боковое меню</h4>
                    <p className="text-sm text-muted-foreground">
                      Для навигации по сайту используйте боковое меню, которое содержит ссылки на все основные разделы:
                      Дашборд, Расписание, Домашние задания, Экзамены и Архив.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Выбор недели</h4>
                    <p className="text-sm text-muted-foreground">
                      Для просмотра информации за определенную неделю используйте селектор недель, который доступен на
                      страницах расписания, домашних заданий и в архиве.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Мобильное использование
              </CardTitle>
              <CardDescription>Особенности работы на мобильных устройствах</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Боковое меню на мобильных устройствах</h4>
                    <p className="text-sm text-muted-foreground">
                      На мобильных устройствах боковое меню скрыто и доступно через кнопку меню в верхнем углу экрана.
                      Нажмите на нее, чтобы открыть меню навигации.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Расписание на мобильных устройствах</h4>
                    <p className="text-sm text-muted-foreground">
                      На мобильных устройствах расписание отображается в виде вкладок по дням недели (Пн, Вт, Ср, Чт,
                      Пт, Сб) для удобства просмотра. Выберите нужный день, чтобы увидеть расписание на этот день.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Типы занятий на мобильных устройствах</h4>
                    <p className="text-sm text-muted-foreground">
                      На мобильных устройствах типы занятий отображаются только в виде цветовых индикаторов без
                      текстовых обозначений для экономии места.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Ориентация экрана</h4>
                    <p className="text-sm text-muted-foreground">
                      Для удобного просмотра расписания на мобильных устройствах рекомендуется использовать
                      горизонтальную ориентацию экрана, особенно для таблиц и расписания.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-primary" />
                Советы по использованию
              </CardTitle>
              <CardDescription>Рекомендации для эффективной работы с сайтом</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Регулярно проверяйте дашборд</h4>
                    <p className="text-sm text-muted-foreground">
                      На дашборде отображается самая актуальная информация о текущей неделе, ближайших экзаменах и
                      домашних заданиях. Рекомендуется проверять его ежедневно.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Следите за дедлайнами</h4>
                    <p className="text-sm text-muted-foreground">
                      Используйте цветовую индикацию для отслеживания сроков сдачи домашних заданий. Красный цвет
                      означает, что дедлайн скоро или уже просрочен.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Скачивайте материалы заранее</h4>
                    <p className="text-sm text-muted-foreground">
                      Рекомендуется скачивать учебные материалы и файлы для подготовки к экзаменам заранее, чтобы иметь
                      к ним доступ даже при отсутствии интернета.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Используйте фильтры</h4>
                    <p className="text-sm text-muted-foreground">
                      Для быстрого поиска нужной информации используйте фильтры по предметам, неделям и другим
                      параметрам, доступные на страницах расписания и домашних заданий.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card className="border-border/40 bg-card card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Часто задаваемые вопросы
              </CardTitle>
              <CardDescription>Ответы на популярные вопросы о сайте</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary">Как узнать текущую неделю?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Текущая неделя отображается на дашборде в специальном блоке с градиентным фоном. Там же вы можете
                    увидеть информацию о количестве оставшихся учебных дней, текущей паре и следующей паре по
                    расписанию.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-primary">Как найти задания по конкретному предмету?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    На странице домашних заданий используйте фильтр по предметам в верхней части страницы. Выберите
                    нужный предмет из выпадающего списка, и система отобразит только задания по этому предмету.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-primary">Где найти материалы для подготовки к экзамену?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Откройте страницу экзаменов, найдите нужный экзамен и нажмите "Подробнее". В развернутой информации
                    будут доступны все материалы для скачивания, включая вопросы к экзамену, примеры билетов и учебные
                    материалы.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-primary">Как посмотреть расписание на следующую неделю?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Используйте селектор недель в верхней части страницы расписания и выберите нужную неделю из
                    выпадающего списка. Вы можете просматривать расписание как на текущую, так и на будущие недели.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-primary">Где найти информацию о прошедших занятиях?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Перейдите в раздел "Архив" и выберите интересующую вас прошедшую неделю. Там вы найдете информацию о
                    расписании, домашних заданиях и экзаменах за выбранный период.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-primary">Что означают цвета в расписании?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Цвета в расписании обозначают различные типы занятий: синий — лекция, зеленый — практика, фиолетовый
                    — лабораторная работа, желтый — консультация, красный — пересдача, оранжевый — экзамен/зачет.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-primary">Как узнать, какая пара идет сейчас?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    На дашборде в блоке "Текущая неделя" отображается информация о текущей паре, времени до ее окончания
                    и следующей паре по расписанию. Эта информация обновляется в реальном времени.
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
