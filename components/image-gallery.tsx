"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Image = {
  id: number
  filename: string
  imageUrl: string
}

type ImageGalleryProps = {
  images: Image[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageGallery({ images, initialIndex = 0, open, onOpenChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Сбрасываем зум и поворот при смене изображения
  useEffect(() => {
    setZoom(1)
    setRotation(0)
  }, [currentIndex])

  // Устанавливаем начальный индекс при открытии
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
    }
  }, [initialIndex, open])

  // Обработка нажатий клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowLeft":
          navigatePrev()
          break
        case "ArrowRight":
          navigateNext()
          break
        case "Escape":
          onOpenChange(false)
          break
        case "+":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        case "r":
          handleRotate()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, currentIndex])

  // Навигация к предыдущему изображению
  const navigatePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  // Навигация к следующему изображению
  const navigateNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // Увеличение масштаба
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  // Уменьшение масштаба
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  // Поворот изображения
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Скачивание изображения
  const handleDownload = () => {
    if (!images[currentIndex]) return

    const link = document.createElement("a")
    link.href = images[currentIndex].imageUrl
    link.download = images[currentIndex].filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!images || images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Просмотр изображения</DialogTitle>

        {/* Верхняя панель */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <div className="text-sm font-medium truncate max-w-[60%]">
            {images[currentIndex]?.filename || "Изображение"} ({currentIndex + 1}/{images.length})
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Уменьшить">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Увеличить">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleRotate} title="Повернуть">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} title="Скачать">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} title="Закрыть">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Основное изображение */}
        <div className="relative flex-1 overflow-hidden bg-black/90 h-[70vh]">
          <div className="absolute inset-0 flex items-center justify-center overflow-auto">
            {images[currentIndex] && (
              <img
                src={images[currentIndex].imageUrl || "/placeholder.svg"}
                alt={images[currentIndex].filename}
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  cursor: zoom > 1 ? "move" : "default",
                }}
              />
            )}
          </div>

          {/* Кнопки навигации */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white h-10 w-10 rounded-full"
            onClick={navigatePrev}
            title="Предыдущее изображение"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white h-10 w-10 rounded-full"
            onClick={navigateNext}
            title="Следующее изображение"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="p-2 border-t bg-muted/50">
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentIndex ? "border-primary" : "border-transparent hover:border-muted-foreground"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    title={image.filename}
                  >
                    <img
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.filename}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
