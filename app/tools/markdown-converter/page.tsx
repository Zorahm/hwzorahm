"use client"

import { useState } from "react"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MarkdownConverter() {
  const [markdown, setMarkdown] = useState<string>("")
  const [plainText, setPlainText] = useState<string>("")

  const convertToPlainText = async () => {
    try {
      // Process the markdown to plain text while preserving spaces
      const result = await unified()
        .use(remarkParse)
        .use(remarkStringify, {
          bullet: "-",
          emphasis: "_",
          strong: "*",
          listItemIndent: "one",
          rule: "-",
          ruleSpaces: false,
          // Preserve whitespace
          fences: true,
          incrementListMarker: true,
        })
        .process(markdown)

      // Convert to string and handle special characters
      const text = String(result)
        .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1") // Replace links with just the text
        .replace(/[*_~`]/g, "") // Remove markdown formatting characters
        .replace(/#{1,6}\s/g, "") // Remove headings
        .replace(/\n>/g, "\n") // Remove blockquote markers
        .replace(/\n\s*[-*+]\s/g, "\n• ") // Convert list items to bullets

      setPlainText(text)
    } catch (error) {
      console.error("Error converting markdown:", error)
      setPlainText("Error converting markdown. Please try again.")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText)
  }

  const handleClear = () => {
    setMarkdown("")
    setPlainText("")
  }

  const exampleMarkdown = `# Заголовок

Это **жирный** текст и *курсив*.

> Это цитата с    сохранением    пробелов.

- Элемент списка 1
- Элемент списка 2
  - Вложенный элемент с    пробелами

\`\`\`
Это блок кода
с    сохранением    пробелов
\`\`\`

[Ссылка на сайт](https://example.com)

    Это текст с отступом
    который должен сохранить пробелы`

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Конвертер Markdown в обычный текст</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Преобразует Markdown в обычный текст с сохранением пробелов и форматирования
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Markdown</CardTitle>
            <CardDescription>Введите или вставьте Markdown текст</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Введите Markdown здесь..."
              className="min-h-[300px] font-mono"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setMarkdown(exampleMarkdown)}>
              Пример
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Очистить
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Обычный текст</CardTitle>
            <CardDescription>Результат конвертации с сохранением пробелов</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              className="min-h-[300px] font-mono"
              value={plainText}
              placeholder="Здесь появится результат конвертации..."
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCopy} disabled={!plainText}>
              Копировать
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={convertToPlainText} disabled={!markdown} size="lg">
          Конвертировать
        </Button>
      </div>
    </div>
  )
}
