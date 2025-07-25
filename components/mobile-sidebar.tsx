"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Clock,
  BookOpen,
  GraduationCap,
  Home,
  Archive,
  Settings,
  BellRing,
  FileText,
  ClipboardList,
  X,
  Code,
  Users,
  ChevronRight,
  Github,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

interface MobileSidebarProps {
  onClose: () => void
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { isAdmin } = useAuth()
  const [version, setVersion] = useState("v2.1.0")
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка версии сайта
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const settings = await response.json()
          if (settings.version) {
            setVersion(settings.version)
          }
        }
      } catch (error) {
        console.error("Error fetching version:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersion()
  }, [])

  const navItems = [
    { name: "Главная", href: "/", icon: Home },
    { name: "Расписание", href: "/schedule", icon: Clock },
    { name: "Домашние задания", href: "/homework", icon: BookOpen },
    { name: "Экзамены", href: "/exams", icon: GraduationCap },
    { name: "Объявления", href: "/announcements", icon: BellRing },
    { name: "Контакты", href: "/contacts", icon: Users },
    { name: "Конспекты", href: "/notes", icon: FileText },
    { name: "Варианты работ", href: "/variants", icon: ClipboardList },
    { name: "Архив", href: "/archive", icon: Archive },
  ]

  const adminItems = [{ href: "/admin", label: "Админ-панель", icon: Settings }]

  const utilityItems = [
    { href: "/tools/markdown-converter", label: "Конвертер Markdown", icon: FileText },
    { href: "/tools/api-docs", label: "API документация", icon: Code },
  ]

  return (
    <div className="flex h-full flex-col bg-[#111111] text-gray-200 relative overflow-hidden">
      {/* Фоновые градиенты */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.06),transparent_50%)] pointer-events-none" />

      {/* Заголовок */}
      <div className="flex items-center justify-between border-b border-white/10 p-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
            <span className="text-sm font-bold text-blue-400">107</span>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">ОККИПд-107</span>
            <p className="text-xs text-gray-400">ZorahM-LMS</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-auto p-4 relative z-10">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-blue-400" : "text-gray-400 group-hover:text-white",
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-blue-400" />}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="my-4 h-px bg-white/10" />
              <div className="px-4 py-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Администрирование
              </div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "bg-purple-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10"
                        : "text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-purple-400" : "text-gray-400 group-hover:text-white",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 text-purple-400" />}
                  </Link>
                )
              })}
            </>
          )}

          <div className="my-4 h-px bg-white/10" />
          <div className="px-4 py-2 text-xs font-semibold text-green-400 uppercase tracking-wider">Утилиты</div>
          {utilityItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-green-500/20 text-white border border-green-500/30 shadow-lg shadow-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-green-400" : "text-gray-400 group-hover:text-white",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-green-400" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Футер */}
      <div className="border-t border-white/10 p-4 relative z-10 space-y-3">
        {/* GitHub ссылка */}
        <a
          href="https://github.com/Zorahm/hwzorahm"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 group"
        >
          <Github className="h-4 w-4 group-hover:text-white transition-colors" />
          <span className="text-xs font-medium flex-1">Open Source</span>
          <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Статус и версия */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">Система активна</span>
          </div>
          <span className="text-xs text-gray-500 font-mono">{isLoading ? "..." : version}</span>
        </div>
      </div>
    </div>
  )
}
