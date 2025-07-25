"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Gift, Crown, Star, Lock } from "lucide-react"

export default function SpecialPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль "special"
    if (!isLoading && (!user || user.role !== "special")) {
      router.push("/")
    } else if (!isLoading && user && user.role === "special") {
      // Запускаем конфетти при загрузке страницы
      setShowConfetti(true)

      // Импортируем и запускаем конфетти
      import("canvas-confetti").then((confetti) => {
        const duration = 5 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now()

          if (timeLeft <= 0) {
            return clearInterval(interval)
          }

          const particleCount = 50 * (timeLeft / duration)

          // Запускаем конфетти с обеих сторон
          confetti.default({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
          confetti.default({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        }, 250)
      })
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || user.role !== "special") {
    return null // Страница будет перенаправлена, но на всякий случай возвращаем null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Поздравляем, вы — избранный!
          </h1>
          <p className="text-xl text-muted-foreground">
            Вы получили доступ к эксклюзивной информации, доступной только для особых пользователей
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Секретные материалы
              </CardTitle>
              <CardDescription>Доступно только для избранных</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Вы получили доступ к секретным материалам, которые недоступны обычным пользователям. Здесь вы найдете
                эксклюзивную информацию о предстоящих экзаменах и специальные учебные материалы.
              </p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-mono">
                  Секретный код доступа: <span className="text-primary">XZ-7291-SPECIAL</span>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Lock className="mr-2 h-4 w-4" /> Открыть секретные материалы
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-500" />
                Специальные возможности
              </CardTitle>
              <CardDescription>Эксклюзивные функции</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Как избранный пользователь, вы получаете доступ к специальным возможностям системы:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Предварительный просмотр расписания на следующий семестр</li>
                <li>Доступ к архивным материалам прошлых лет</li>
                <li>Специальные подсказки для экзаменов</li>
                <li>Расширенная статистика успеваемости</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Star className="mr-2 h-4 w-4" /> Активировать возможности
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="border-2 border-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Секретное сообщение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-sm overflow-hidden">
              <p className="typewriter-text">
                &gt; ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...
                <br />
                &gt; ДОСТУП РАЗРЕШЕН: ПОЛЬЗОВАТЕЛЬ "KOZLOPUCH"
                <br />
                &gt; ЗАГРУЗКА СЕКРЕТНЫХ ДАННЫХ...
                <br />
                &gt; СООБЩЕНИЕ: Поздравляем с получением специального доступа! Вы были выбраны для тестирования новых
                функций системы.
                <br />
                &gt; ВАЖНО: Не разглашайте информацию о наличии этой страницы другим пользователям.
                <br />
                &gt; СТАТУС: ВЫ ИЗБРАННЫЙ
                <br />
                &gt; КОНЕЦ ПЕРЕДАЧИ.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS для анимации текста */}
      <style jsx>{`
        .typewriter-text {
          overflow: hidden;
          border-right: .15em solid green;
          white-space: nowrap;
          margin: 0 auto;
          letter-spacing: .1em;
          animation: 
            typing 3.5s steps(40, end),
            blink-caret .75s step-end infinite;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: green; }
        }
      `}</style>
    </div>
  )
}
