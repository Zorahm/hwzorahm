"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen } from "lucide-react"

// Классы для генерации шума и волн
class Grad {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  dot2(x: number, y: number) {
    return this.x * x + this.y * y
  }
}

class Noise {
  grad3: Grad[]
  p: number[]
  perm: number[]
  gradP: Grad[]

  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ]
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
      21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
      237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
      111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216,
      80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186,
      3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
      17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193,
      238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128,
      195, 78, 66, 215, 61, 156, 180,
    ]
    this.perm = new Array(512)
    this.gradP = new Array(512)
    this.seed(seed)
  }

  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536
    seed = Math.floor(seed)
    if (seed < 256) seed |= seed << 8
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255)
      this.perm[i] = this.perm[i + 256] = v
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12]
    }
  }

  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b
  }

  perlin2(x: number, y: number) {
    let X = Math.floor(x),
      Y = Math.floor(y)
    x -= X
    y -= Y
    X &= 255
    Y &= 255
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y)
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1)
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y)
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1)
    const u = this.fade(x)
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y))
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      router.push("/")
    }

    setIsLoading(false)
  }

  // Волновой фон
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const noise = new Noise(Math.random())
    let lines: any[] = []
    const mouse = { x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false }
    let frameId: number

    const config = {
      lineColor: "rgba(255, 255, 255, 0.1)",
      waveSpeedX: 0.008,
      waveSpeedY: 0.003,
      waveAmpX: 24,
      waveAmpY: 12,
      friction: 0.92,
      tension: 0.004,
      maxCursorMove: 80,
      xGap: 12,
      yGap: 24,
    }

    function setSize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function setLines() {
      lines = []
      const oWidth = canvas.width + 200,
        oHeight = canvas.height + 30
      const totalLines = Math.ceil(oWidth / config.xGap)
      const totalPoints = Math.ceil(oHeight / config.yGap)
      const xStart = (canvas.width - config.xGap * totalLines) / 2
      const yStart = (canvas.height - config.yGap * totalPoints) / 2
      for (let i = 0; i <= totalLines; i++) {
        const pts = []
        for (let j = 0; j <= totalPoints; j++) {
          pts.push({
            x: xStart + config.xGap * i,
            y: yStart + config.yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          })
        }
        lines.push(pts)
      }
    }

    function movePoints(time: number) {
      lines.forEach((pts) => {
        pts.forEach((p: any) => {
          const move =
            noise.perlin2((p.x + time * config.waveSpeedX) * 0.002, (p.y + time * config.waveSpeedY) * 0.0015) * 12
          p.wave.x = Math.cos(move) * config.waveAmpX
          p.wave.y = Math.sin(move) * config.waveAmpY

          const dx = p.x - mouse.sx,
            dy = p.y - mouse.sy
          const dist = Math.hypot(dx, dy),
            l = Math.max(150, mouse.vs)
          if (dist < l) {
            const s = 1 - dist / l
            const f = Math.cos(dist * 0.001) * s
            p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.0004
            p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.0004
          }

          p.cursor.vx += (0 - p.cursor.x) * config.tension
          p.cursor.vy += (0 - p.cursor.y) * config.tension
          p.cursor.vx *= config.friction
          p.cursor.vy *= config.friction
          p.cursor.x += p.cursor.vx * 2
          p.cursor.y += p.cursor.vy * 2
          p.cursor.x = Math.min(config.maxCursorMove, Math.max(-config.maxCursorMove, p.cursor.x))
          p.cursor.y = Math.min(config.maxCursorMove, Math.max(-config.maxCursorMove, p.cursor.y))
        })
      })
    }

    function moved(point: any, withCursor = true) {
      const x = point.x + point.wave.x + (withCursor ? point.cursor.x : 0)
      const y = point.y + point.wave.y + (withCursor ? point.cursor.y : 0)
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
    }

    function drawLines() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = config.lineColor
      ctx.lineWidth = 1
      lines.forEach((points) => {
        let p1 = moved(points[0], false)
        ctx.moveTo(p1.x, p1.y)
        points.forEach((p: any, idx: number) => {
          const isLast = idx === points.length - 1
          p1 = moved(p, !isLast)
          const p2 = moved(points[idx + 1] || points[points.length - 1], !isLast)
          ctx.lineTo(p1.x, p1.y)
          if (isLast) ctx.moveTo(p2.x, p2.y)
        })
      })
      ctx.stroke()
    }

    function tick(t: number) {
      mouse.sx += (mouse.x - mouse.sx) * 0.1
      mouse.sy += (mouse.y - mouse.sy) * 0.1
      const dx = mouse.x - mouse.lx,
        dy = mouse.y - mouse.ly
      const d = Math.hypot(dx, dy)
      mouse.v = d
      mouse.vs += (d - mouse.vs) * 0.1
      mouse.vs = Math.min(80, mouse.vs)
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      mouse.a = Math.atan2(dy, dx)

      movePoints(t)
      drawLines()
      frameId = requestAnimationFrame(tick)
    }

    function updateMouse(x: number, y: number) {
      mouse.x = x
      mouse.y = y
      if (!mouse.set) {
        mouse.sx = mouse.x
        mouse.sy = mouse.y
        mouse.lx = mouse.x
        mouse.ly = mouse.y
        mouse.set = true
      }
    }

    const handleResize = () => {
      setSize()
      setLines()
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateMouse(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      updateMouse(touch.clientX, touch.clientY)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })

    setSize()
    setLines()
    frameId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-[#0d0d0d] text-gray-200 relative overflow-hidden">
      {/* Движущийся волновой фон */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: "#0d0d0d" }}
      />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl w-full items-center p-6 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm relative z-10">
        {/* Левая колонка - форма входа */}
        <div className="max-w-md mx-auto lg:mx-0">
          <span className="inline-flex items-center gap-2 border border-white/5 bg-[#1f1f1f] px-3 py-1 rounded-full text-xs font-medium text-gray-400 tracking-wide mb-6">
            <BookOpen className="w-3 h-3" />
            Secure Access
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">Вход в систему</h1>

          <p className="text-base sm:text-lg font-light text-gray-400 mb-8 leading-relaxed">
            Войдите для доступа к панели управления расписанием и продолжите управление вашими операциями.
          </p>

          <Card className="border-white/10 bg-transparent shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Логин
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Введите логин"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg text-sm bg-[#181818] border-[#2d2d2d] text-gray-200"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg text-sm bg-[#181818] border-[#2d2d2d] text-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                      Запомнить меня
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Забыли пароль?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Вход...</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10,17 15,12 10,7"></polyline>
                        <line x1="15" x2="3" y1="12" y2="12"></line>
                      </svg>
                      <span>Войти</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - визуализация */}
        <div className="relative hidden lg:block">
          <div className="h-[600px] flex items-center justify-center text-center bg-[url('https://images.unsplash.com/photo-1709706696753-1dc4f13d0cc4?w=1080&q=80')] bg-cover rounded-2xl p-8">
            <div className="text-left">
              <div className="w-24 h-24 flex items-center justify-center rounded-2xl mb-4 mx-auto backdrop-blur-md border border-white/5 bg-white/5">
                <BookOpen className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="uppercase text-3xl font-normal text-white tracking-tight text-right mb-2">ZorahM-LMS</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}