"use client"

import { useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Загрузка KaTeX стилей
  useEffect(() => {
    // Проверяем, загружены ли уже стили KaTeX
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
      link.integrity = "sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
      link.crossOrigin = "anonymous"
      document.head.appendChild(link)
    }
  }, [])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Обработка изображений
        img: ({ node, ...props }) => (
          <img
            {...props}
            className="rounded-md max-w-full h-auto my-4"
            loading="lazy"
            alt={props.alt || "Изображение"}
          />
        ),
        // Подсветка синтаксиса для блоков кода
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="rounded-md my-4"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={`${className || ""} px-1 py-0.5 bg-muted rounded text-sm`} {...props}>
              {children}
            </code>
          )
        },
        // Стилизация таблиц
        table({ node, ...props }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          )
        },
        thead({ node, ...props }) {
          return <thead className="bg-muted" {...props} />
        },
        th({ node, ...props }) {
          return <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" {...props} />
        },
        td({ node, ...props }) {
          return <td className="px-4 py-2 text-sm" {...props} />
        },
        // Стилизация заголовков
        h1({ node, ...props }) {
          return <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
        },
        h2({ node, ...props }) {
          return <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
        },
        h3({ node, ...props }) {
          return <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
        },
        // Стилизация списков
        ul({ node, ...props }) {
          return <ul className="list-disc pl-6 my-4" {...props} />
        },
        ol({ node, ...props }) {
          return <ol className="list-decimal pl-6 my-4" {...props} />
        },
        // Стилизация блоков цитат
        blockquote({ node, ...props }) {
          return <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props} />
        },
        // Стилизация параграфов
        p({ node, ...props }) {
          return <p className="my-3" {...props} />
        },
        // Стилизация ссылок
        a({ node, ...props }) {
          return <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
