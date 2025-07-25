"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

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

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tetrisCanvasRef = useRef<HTMLCanvasElement>(null)
  const scoreRef = useRef<HTMLSpanElement>(null)
  const linesRef = useRef<HTMLSpanElement>(null)
  const restartBtnRef = useRef<HTMLButtonElement>(null)

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
      lineColor: "rgba(255, 255, 255, 0.17)",
      waveSpeedX: 0.008,
      waveSpeedY: 0.0025,
      waveAmpX: 22,
      waveAmpY: 13,
      friction: 0.92,
      tension: 0.004,
      maxCursorMove: 80,
      xGap: 14,
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

  // Тетрис
  useEffect(() => {
    const canvas = tetrisCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scoreElement = scoreRef.current
    const linesElement = linesRef.current
    const restartBtn = restartBtnRef.current

    if (!scoreElement || !linesElement || !restartBtn) return

    const COLS = 10,
      ROWS = 20,
      BLOCK = 20
    const COLORS = ["#f87171", "#facc15", "#34d399", "#38bdf8", "#a78bfa", "#f472b6", "#fbbf24"]
    const SHAPES = [
      [[1, 1, 1, 1]], // I
      [
        [1, 1, 1],
        [0, 1, 0],
      ], // T
      [
        [1, 1, 0],
        [0, 1, 1],
      ], // S
      [
        [0, 1, 1],
        [1, 1, 0],
      ], // Z
      [
        [1, 1],
        [1, 1],
      ], // O
      [
        [1, 1, 1],
        [1, 0, 0],
      ], // L
      [
        [1, 1, 1],
        [0, 0, 1],
      ], // J
    ]

    let board: number[][]
    let curr: { x: number; y: number; shape: number[][]; color: number; idx: number }
    let gameOver: boolean
    let score: number
    let lines: number
    let dropTime: number
    let dropTimer: ReturnType<typeof setTimeout>

    function resetGame() {
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
      curr = makePiece()
      score = 0
      lines = 0
      gameOver = false
      dropTime = 600
      scoreElement.textContent = score.toString()
      linesElement.textContent = lines.toString()
      draw()
      stopLoop()
      loop()
    }

    function makePiece() {
      const idx = Math.floor(Math.random() * SHAPES.length)
      return {
        x: 3,
        y: -2,
        shape: SHAPES[idx].map((row) => row.slice()),
        color: idx + 1,
        idx,
      }
    }

    function rotate(shape: number[][]) {
      return shape[0].map((_, i) => shape.map((row) => row[i]).reverse())
    }

    function valid(pos: { x: number; y: number }, shape: number[][]) {
      for (let y = 0; y < shape.length; y++)
        for (let x = 0; x < shape[0].length; x++)
          if (shape[y][x]) {
            const nx = pos.x + x,
              ny = pos.y + y
            if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx])) return false
          }
      return true
    }

    function merge() {
      curr.shape.forEach((row, y) =>
        row.forEach((v, x) => {
          if (v && curr.y + y >= 0) board[curr.y + y][curr.x + x] = curr.color
        }),
      )
    }

    function clearLines() {
      let count = 0
      for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every((v) => v)) {
          board.splice(y, 1)
          board.unshift(Array(COLS).fill(0))
          count++
          y++
        }
      }
      if (count) {
        score += count * 100
        lines += count
        scoreElement.textContent = score.toString()
        linesElement.textContent = lines.toString()
        dropTime = Math.max(80, dropTime - 20 * count)
      }
    }

    function drop() {
      if (gameOver) return
      const next = { ...curr, y: curr.y + 1 }
      if (valid(next, curr.shape)) {
        curr.y++
      } else {
        if (curr.y < 0) {
          gameOver = true
          draw()
          return
        }
        merge()
        clearLines()
        curr = makePiece()
        if (!valid(curr, curr.shape)) {
          gameOver = true
          draw()
          return
        }
      }
      draw()
    }

    function move(dir: number) {
      if (gameOver) return
      const next = { ...curr, x: curr.x + dir }
      if (valid(next, curr.shape)) curr.x += dir
      draw()
    }

    function hardDrop() {
      if (gameOver) return
      while (valid({ ...curr, y: curr.y + 1 }, curr.shape)) curr.y++
      draw()
    }

    function rotatePiece() {
      if (gameOver) return
      const nextShape = rotate(curr.shape)
      if (valid(curr, nextShape)) curr.shape = nextShape
      else if (valid({ ...curr, x: curr.x - 1 }, nextShape)) {
        curr.x--
        curr.shape = nextShape
      } else if (valid({ ...curr, x: curr.x + 1 }, nextShape)) {
        curr.x++
        curr.shape = nextShape
      }
      draw()
    }

    function drawCell(x: number, y: number, color: string) {
      if (!ctx) return
      ctx.fillStyle = color
      ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2)
    }

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, COLS * BLOCK, ROWS * BLOCK)
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) if (board[y][x]) drawCell(x, y, COLORS[board[y][x] - 1])
      curr.shape.forEach((row, dy) =>
        row.forEach((v, dx) => {
          if (v && curr.y + dy >= 0) drawCell(curr.x + dx, curr.y + dy, COLORS[curr.color - 1])
        }),
      )
      if (gameOver) {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.fillStyle = "#09090bcc"
        ctx.fillRect(0, (ROWS * BLOCK) / 2 - 40, COLS * BLOCK, 80)
        ctx.globalAlpha = 1
        ctx.font = "bold 22px monospace"
        ctx.fillStyle = "#fbbf24"
        ctx.textAlign = "center"
        ctx.fillText("Игра окончена", (COLS * BLOCK) / 2, (ROWS * BLOCK) / 2)
        ctx.font = "16px monospace"
        ctx.fillStyle = "#94a3b8"
        ctx.fillText(`Счёт: ${score} | Линии: ${lines}`, (COLS * BLOCK) / 2, (ROWS * BLOCK) / 2 + 28)
        ctx.restore()
      }
    }

    function loop() {
      if (!gameOver) {
        drop()
        dropTimer = setTimeout(loop, dropTime)
      }
    }

    function stopLoop() {
      clearTimeout(dropTimer)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return
      if (e.key === "ArrowLeft") move(-1)
      else if (e.key === "ArrowRight") move(1)
      else if (e.key === "ArrowUp") rotatePiece()
      else if (e.key === "ArrowDown") {
        drop()
        stopLoop()
        loop()
      } else if (e.code === "Space") {
        hardDrop()
        drop()
        stopLoop()
        loop()
      }
    }

    const handleRestart = () => {
      stopLoop()
      resetGame()
    }

    window.addEventListener("keydown", handleKeyDown)
    restartBtn.addEventListener("click", handleRestart)

    ctx.imageSmoothingEnabled = false
    resetGame()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      restartBtn.removeEventListener("click", handleRestart)
      stopLoop()
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        body {
          background: #0d0d0d;
          color: #e5e7eb;
          font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .badge {
          font-size: 0.65rem;
          background: #1f1f1f;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          letter-spacing: 0.04em;
          color: #a1a1aa;
        }
        .waves-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }
        #background-waves {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }
        .font-instrument-serif {
          font-family: "Instrument Serif", serif !important;
        }
        .font-bricolage {
          font-family: "Bricolage Grotesque", sans-serif !important;
        }
        #tetris-canvas {
          image-rendering: pixelated;
          background: #18181b;
          border-radius: 1.25rem;
          box-shadow: 0 0 32px 0 #3b82f688;
          border: 2px solid #33415544;
          margin-bottom: 0.5rem;
        }
      `}</style>

      {/* Background Waves Shader */}
      <div id="background-waves">
        <canvas ref={canvasRef} id="waves-canvas" className="waves-canvas"></canvas>
      </div>

      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-4xl w-full items-center p-6 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm shadow-xl relative z-10">
          {/* Left: Main 404 content */}
          <div className="w-full max-w-lg mx-auto text-center lg:text-left">
            <span className="badge inline-flex items-center gap-2 border-white/5 border mb-6">
              <AlertCircle className="w-3 h-3" />
              Ошибка 404
            </span>
            <h1 className="font-bricolage text-white font-black text-5xl sm:text-6xl mb-3 tracking-tight">
              Страница не найдена
            </h1>
            <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed font-light max-w-xl">
              К сожалению, запрошенная страница не существует или была перемещена.
              <br />
              Проверьте адрес или вернитесь на главную страницу.
              <br />
              <span className="block mt-3 text-blue-300 font-medium">Пока вы здесь — сыграйте в Тетрис! 🎮</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center lg:justify-start">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 -ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                На главную
              </Link>
              <a
                href="mailto:support@zorahm.ru"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white/10 text-blue-200 hover:bg-white/20 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 -ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                Связаться с поддержкой
              </a>
            </div>
          </div>

          {/* Right: TETRIS GAME */}
          <div className="hidden lg:flex flex-col items-center justify-center w-full max-w-xs">
            <div className="w-full h-[432px] flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-800/60 via-blue-900/80 to-blue-900/90 shadow-lg border border-white/10 relative p-6">
              <h2 className="text-2xl font-bold font-bricolage text-blue-300 mb-1">Тетрис</h2>
              <div className="text-xs text-blue-100 mb-2 text-center">
                ⬅️ ←, ➡️ →, ⬆️ — поворот, ⬇️ — вниз, Space — drop
              </div>
              <canvas ref={tetrisCanvasRef} id="tetris-canvas" width="200" height="400" className="mx-auto"></canvas>
              <div className="flex flex-row gap-6 items-center mt-1">
                <div className="text-blue-200 font-semibold text-base font-mono">
                  Счёт:{" "}
                  <span ref={scoreRef} id="score">
                    0
                  </span>
                </div>
                <div className="text-blue-200 font-semibold text-base font-mono">
                  Линии:{" "}
                  <span ref={linesRef} id="lines">
                    0
                  </span>
                </div>
              </div>
              <button
                ref={restartBtnRef}
                id="restart-btn"
                className="px-4 py-2 rounded-xl mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-150 text-sm"
              >
                Сыграть снова
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}