"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { toast } from "sonner"

interface VersionEditorProps {
  currentVersion: string
  onVersionUpdate: (newVersion: string) => void
}

export function VersionEditor({ currentVersion, onVersionUpdate }: VersionEditorProps) {
  const [version, setVersion] = useState(currentVersion)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!version.trim()) {
      toast.error("Версия не может быть пустой")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "version", value: version }),
      })

      if (!response.ok) {
        throw new Error("Ошибка при обновлении версии")
      }

      toast.success("Версия успешно обновлена")
      onVersionUpdate(version)
      setIsOpen(false)
    } catch (error) {
      console.error("Error updating version:", error)
      toast.error("Не удалось обновить версию")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings className="h-3.5 w-3.5" />
          <span className="text-xs">Версия</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование версии сайта</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="version">Номер версии</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Например: v1.5.0"
            />
            <p className="text-xs text-muted-foreground">
              Версия будет отображаться в сайдбаре на ПК и мобильных устройствах
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
