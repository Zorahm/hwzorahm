"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function ApiDocsPage() {
  const [isProduction, setIsProduction] = useState(false)
  const baseUrl = isProduction ? "https://hw.zorahm.ru" : "http://localhost:3000"

  const endpoints = [
    {
      category: "Объявления",
      routes: [
        {
          method: "GET",
          path: "/api/announcements",
          description: "Получить все объявления",
          example: `curl -X GET ${baseUrl}/api/announcements`,
        },
      ],
    },
    {
      category: "Варианты работ",
      routes: [
        {
          method: "GET",
          path: "/api/variants/groups",
          description: "Получить все группы вариантов",
          example: `curl -X GET ${baseUrl}/api/variants/groups`,
        },
        {
          method: "GET",
          path: "/api/variants",
          description: "Получить варианты (с фильтром по группе)",
          params: "?groupId=number",
          example: `curl -X GET "${baseUrl}/api/variants?groupId=1"`,
        },
        {
          method: "GET",
          path: "/api/variants/[id]/files",
          description: "Получить файлы варианта",
          example: `curl -X GET ${baseUrl}/api/variants/1/files`,
        },
      ],
    },
    {
      category: "Расписание",
      routes: [
        {
          method: "GET",
          path: "/api/schedule",
          description: "Получить расписание",
          params: "?weekId=number",
          example: `curl -X GET "${baseUrl}/api/schedule?weekId=1"`,
        },
      ],
    },
    {
      category: "Домашние задания",
      routes: [
        {
          method: "GET",
          path: "/api/homework",
          description: "Получить все домашние задания",
          params: "?weekId=number",
          example: `curl -X GET "${baseUrl}/api/homework?weekId=1"`,
        },
      ],
    },
    {
      category: "Экзамены",
      routes: [
        {
          method: "GET",
          path: "/api/exams",
          description: "Получить все экзамены",
          example: `curl -X GET ${baseUrl}/api/exams`,
        },
      ],
    },
    {
      category: "Заметки",
      routes: [
        {
          method: "GET",
          path: "/api/notes",
          description: "Получить все заметки",
          params: "?weekId=number",
          example: `curl -X GET "${baseUrl}/api/notes?weekId=1"`,
        },
      ],
    },
    {
      category: "Недели",
      routes: [
        {
          method: "GET",
          path: "/api/weeks",
          description: "Получить все недели",
          example: `curl -X GET ${baseUrl}/api/weeks`,
        },
        {
          method: "GET",
          path: "/api/weeks/current",
          description: "Получить текущую неделю",
          example: `curl -X GET ${baseUrl}/api/weeks/current`,
        },
      ],
    },
    {
      category: "Файлы",
      routes: [
        {
          method: "GET",
          path: "/api/files/[...path]",
          description: "Получить файл по пути",
          example: `curl -X GET ${baseUrl}/api/files/uploads/document.pdf`,
        },
      ],
    },
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "POST":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "PUT":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "PATCH":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "DELETE":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <Code className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">API Документация</h1>
            <p className="text-gray-400 mt-1">Полное руководство по взаимодействию с API</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
        <div>
          <h3 className="font-semibold text-white">Среда тестирования</h3>
          <p className="text-sm text-gray-400">Выберите среду для примеров API запросов</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-sm ${!isProduction ? "font-semibold text-white" : "text-gray-400"}`}>Localhost</span>
          <Switch checked={isProduction} onCheckedChange={setIsProduction} />
          <span className={`text-sm ${isProduction ? "font-semibold text-white" : "text-gray-400"}`}>Production</span>
        </div>
      </div>

      <Alert className="border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
        <AlertDescription className="text-amber-300">
          <strong>Важно:</strong> Данный API не требует аутентификации и токенов. Все endpoints открыты для
          использования. В production-среде рекомендуется добавить соответствующие меры безопасности.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/5 border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-white">
            Обзор
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-white">
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="examples" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-white">
            Примеры
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-white">
            Инструменты
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <Code className="h-4 w-4 text-blue-400" />
                </div>
                <span>Общая информация</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Основные принципы работы с API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-white">Базовый URL</h3>
                <code className="bg-white/10 px-3 py-2 rounded-lg text-sm text-blue-300 block">{baseUrl}/api</code>
                <p className="text-xs text-gray-400 mt-1">
                  {isProduction ? "Production среда" : "Локальная среда разработки"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">Формат данных</h3>
                <p className="text-sm text-gray-400 mb-2">
                  API принимает и возвращает данные в формате JSON. Для POST и PUT запросов необходимо указывать
                  заголовок:
                </p>
                <code className="bg-white/10 px-3 py-2 rounded-lg text-sm text-blue-300 block">
                  Content-Type: application/json
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">HTTP методы</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor("GET")}>GET</Badge>
                    <span className="text-gray-300">Получение данных</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor("POST")}>POST</Badge>
                    <span className="text-gray-300">Создание новых записей</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor("PUT")}>PUT</Badge>
                    <span className="text-gray-300">Полное обновление записей</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor("PATCH")}>PATCH</Badge>
                    <span className="text-gray-300">Частичное обновление записей</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor("DELETE")}>DELETE</Badge>
                    <span className="text-gray-300">Удаление записей</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">Коды ответов</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>
                    <code className="text-green-400">200</code> - Успешный запрос
                  </div>
                  <div>
                    <code className="text-green-400">201</code> - Ресурс создан
                  </div>
                  <div>
                    <code className="text-yellow-400">400</code> - Неверный запрос
                  </div>
                  <div>
                    <code className="text-orange-400">404</code> - Ресурс не найден
                  </div>
                  <div>
                    <code className="text-red-400">500</code> - Внутренняя ошибка сервера
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {endpoints.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.routes.map((route, routeIndex) => (
                    <div key={routeIndex} className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getMethodColor(route.method)}>{route.method}</Badge>
                        <code className="bg-white/10 px-3 py-2 rounded-lg text-sm flex-1 min-w-0 text-blue-300">
                          {route.path}
                          {route.params && <span className="text-gray-400">{route.params}</span>}
                        </code>
                      </div>

                      <p className="text-sm text-gray-400">{route.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Примеры использования</CardTitle>
              <CardDescription className="text-gray-400">Практические примеры работы с API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-white">Получение всех объявлений</h3>
                <pre className="bg-black/50 p-4 rounded-lg text-sm overflow-x-auto text-gray-300 border border-white/10">
                  {`curl -X GET ${baseUrl}/api/announcements

# С красивым форматированием (требует jq)
curl -X GET ${baseUrl}/api/announcements | jq '.'`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-white">Получение расписания на неделю</h3>
                <pre className="bg-black/50 p-4 rounded-lg text-sm overflow-x-auto text-gray-300 border border-white/10">
                  {`curl -X GET "${baseUrl}/api/schedule?weekId=1"`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Рекомендуемые инструменты</CardTitle>
              <CardDescription className="text-gray-400">Инструменты для тестирования и работы с API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-white">1. cURL (встроен в большинство систем)</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Универсальный инструмент командной строки для HTTP запросов
                </p>
                <pre className="bg-black/50 p-3 rounded-lg text-sm text-gray-300 border border-white/10">
                  {`# Простой GET запрос
curl -X GET ${baseUrl}/api/announcements

# POST запрос с данными
curl -X POST ${baseUrl}/api/announcements \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Test", "content": "Content"}'`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-white">2. HTTPie (более удобный синтаксис)</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Установка:{" "}
                  <code className="bg-white/10 px-2 py-1 rounded text-blue-300">sudo apt install httpie</code>
                </p>
                <pre className="bg-black/50 p-3 rounded-lg text-sm text-gray-300 border border-white/10">
                  {`# GET запрос
http GET ${baseUrl}/api/announcements

# POST запрос
http POST ${baseUrl}/api/announcements \\
  title="Test" content="Content" priority="medium"`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-white">3. jq (для форматирования JSON)</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Установка: <code className="bg-white/10 px-2 py-1 rounded text-blue-300">sudo apt install jq</code>
                </p>
                <pre className="bg-black/50 p-3 rounded-lg text-sm text-gray-300 border border-white/10">
                  {`# Красивое форматирование ответа
curl -X GET ${baseUrl}/api/announcements | jq '.'

# Фильтрация данных
curl -X GET ${baseUrl}/api/announcements | jq '.[] | .title'`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-white">4. Postman / Insomnia</h3>
                <p className="text-sm text-gray-400">
                  Графические инструменты для тестирования API с удобным интерфейсом. Позволяют сохранять коллекции
                  запросов и автоматизировать тестирование.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-white">5. Скрипт для массового тестирования</h3>
                <pre className="bg-black/50 p-3 rounded-lg text-sm overflow-x-auto text-gray-300 border border-white/10">
                  {`#!/bin/bash
# test-api.sh

BASE_URL="${baseUrl}/api"

echo "=== Тестирование API ==="

echo "1. Объявления..."
curl -s -X GET $BASE_URL/announcements | jq '.' > /dev/null && echo "✓ OK" || echo "✗ ERROR"

echo "2. Варианты..."
curl -s -X GET $BASE_URL/variants/groups | jq '.' > /dev/null && echo "✓ OK" || echo "✗ ERROR"

echo "3. Расписание..."
curl -s -X GET $BASE_URL/schedule | jq '.' > /dev/null && echo "✓ OK" || echo "✗ ERROR"

echo "=== Тестирование завершено ==="

# Запуск: chmod +x test-api.sh && ./test-api.sh`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}