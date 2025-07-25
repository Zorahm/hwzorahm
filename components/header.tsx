"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Menu, LogIn, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const isMobile = useMobile()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <>
      {/* Фоновые градиенты */}
      <div className="fixed inset-0 bg-[#0d0d0d] -z-50"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)] -z-50"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.06),transparent_50%)] -z-50"></div>

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/5">
        <div className="container flex h-16 items-center">
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-[#111111] border-white/10">
                <MobileSidebar onClose={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">ZorahM-LMS</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 hidden sm:block">
                    Добро пожаловать, <span className="text-blue-400 font-medium">{user.email}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 text-gray-300 hover:text-white hover:bg-red-500/20 border border-white/10 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className={isMobile ? "sr-only" : ""}>Выйти</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogin}
                  className="gap-2 text-gray-300 hover:text-white hover:bg-blue-500/20 border border-white/10 transition-all duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span className={isMobile ? "sr-only" : ""}>Войти</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}