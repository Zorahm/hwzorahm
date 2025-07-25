"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface WorkVariant {
  id: number
  title: string
  description: string | null
  isOccupied: boolean
  studentName: string | null
}

interface WorkGroup {
  id: number
  title: string
  description: string | null
  variants: WorkVariant[]
}

// Функция для сортировки вариантов по числовому порядку
const sortVariantsByNumber = (variants: WorkVariant[]): WorkVariant[] => {
  return [...variants].sort((a, b) => {
    // Извлекаем числа из названий вариантов
    const numA = Number.parseInt(a.title.match(/\d+/)?.[0] || "0")
    const numB = Number.parseInt(b.title.match(/\d+/)?.[0] || "0")

    // Если оба названия содержат числа, сортируем по ним
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }

    // Иначе сортируем по алфавиту
    return a.title.localeCompare(b.title)
  })
}

const VariantsPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<WorkGroup[]>([])
  const [variants, setVariants] = useState<WorkVariant[]>([])
  const [selectedGroup, setSelectedGroup] = useState<WorkGroup | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<WorkVariant | null>(null)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [studentName, setStudentName] = useState("")
  const [activeTab, setActiveTab] = useState<"groups" | "variants">("groups")

  const searchParams = useSearchParams()
  const groupId = Number(searchParams.get("groupId"))

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/variants/groups")
        if (!response.ok) {
          throw new Error("Ошибка при загрузке групп")
        }
        const data = await response.json()
        setGroups(data)
      } catch (error) {
        console.error("Error fetching groups:", error)
        toast.error("Не удалось загрузить группы")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  useEffect(() => {
    if (groupId) {
      fetchVariants(groupId)
    }
  }, [groupId])

  // Загрузка вариантов для выбранной группы
  const fetchVariants = async (groupId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/variants/groups/${groupId}`)
      if (!response.ok) {
        throw new Error("Ошибка при загрузке вариантов")
      }
      const data = await response.json()
      setSelectedGroup(data)
      // Применяем сортировку к вариантам
      setVariants(sortVariantsByNumber(data.variants))
      setActiveTab("variants")
    } catch (error) {
      console.error("Error fetching variants:", error)
      toast.error("Не удалось загрузить варианты")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariantSubmit = async () => {
    if (!selectedVariant) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/variants/${selectedVariant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: studentName,
          isOccupied: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Не удалось занять вариант")
      }

      toast.success(`Вариант "${selectedVariant.title}" успешно занят!`)
      setIsSubmitDialogOpen(false)
      setStudentName("")
      if (selectedGroup) {
        fetchVariants(selectedGroup.id) // Refresh variants
      }
    } catch (error) {
      console.error("Error submitting variant:", error)
      toast.error("Не удалось занять вариант")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="groups">Группы</TabsTrigger>
          {selectedGroup && <TabsTrigger value="variants">Варианты группы "{selectedGroup.title}"</TabsTrigger>}
        </TabsList>
        <TabsContent value="groups">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fetchVariants(group.id)}
                >
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold">{group.title}</h3>
                    {group.description && <p className="text-sm text-muted-foreground mt-2">{group.description}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        {selectedGroup && (
          <TabsContent value="variants">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {variants.map((variant) => (
                  <Card
                    key={variant.id}
                    className={`overflow-hidden ${
                      variant.isOccupied
                        ? "border-primary/30 bg-primary/5"
                        : "hover:border-primary/50 transition-colors cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!variant.isOccupied) {
                        setSelectedVariant(variant)
                        setIsSubmitDialogOpen(true)
                      }
                    }}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{variant.title}</h3>
                          {variant.isOccupied ? (
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Занят</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Свободен
                            </Badge>
                          )}
                        </div>
                        {!variant.isOccupied && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVariant(variant)
                              setIsSubmitDialogOpen(true)
                            }}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Выбрать вариант
                          </Button>
                        )}
                      </div>

                      {variant.description && (
                        <div className="mt-3">
                          <MarkdownRenderer content={variant.description} />
                        </div>
                      )}

                      {variant.isOccupied && variant.studentName && (
                        <div className="mt-4 bg-primary/5 rounded-md border border-primary/20 overflow-hidden">
                          <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-sm font-medium text-primary">
                            Занят студентом
                          </div>
                          <div className="px-3 py-2 text-base">{variant.studentName}</div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подтверждение выбора варианта</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите выбрать вариант "{selectedVariant?.title}"? Пожалуйста, укажите ваше ФИО.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ФИО
              </Label>
              <Input
                id="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsSubmitDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" onClick={handleVariantSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VariantsPage
