"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { toast } from "sonner"
import { Plus, Edit, Trash2, FileText, Users, X, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

// Типы данных
interface WorkVariant {
  id: number
  title: string
  description: string
  isOccupied: boolean
  studentName: string | null
  groupId: number
  createdAt: string
  updatedAt: string
}

interface WorkVariantGroup {
  id: number
  title: string
  description: string | null
  isActive: boolean
  variants: WorkVariant[]
  createdAt: string
  updatedAt: string
}

// Функция для сортировки вариантов по числовому порядку
const sortVariantsByNumber = (a: WorkVariant, b: WorkVariant): number => {
  // Извлекаем числа из названий вариантов
  const numA = a.title.match(/\d+/)
  const numB = b.title.match(/\d+/)

  // Если оба названия содержат числа, сортируем по числовым значениям
  if (numA && numB) {
    return Number.parseInt(numA[0]) - Number.parseInt(numB[0])
  }

  // Если только одно название содержит число
  if (numA) return -1
  if (numB) return 1

  // Если ни одно название не содержит числа, сортируем по алфавиту
  return a.title.localeCompare(b.title)
}

export function AdminVariants() {
  const [groups, setGroups] = useState<WorkVariantGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<WorkVariantGroup | null>(null)
  const [variants, setVariants] = useState<WorkVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("groups")
  const [showInactive, setShowInactive] = useState(false)
  const isMobile = useMobile()

  // Состояния для диалогов
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<WorkVariantGroup | null>(null)
  const [editingVariant, setEditingVariant] = useState<WorkVariant | null>(null)

  // Состояния для форм
  const [groupForm, setGroupForm] = useState({
    title: "",
    description: "",
    isActive: true,
  })

  const [variantForm, setVariantForm] = useState({
    title: "",
    description: "",
    groupId: 0,
  })

  const [bulkVariantsText, setBulkVariantsText] = useState("")

  // Загрузка групп вариантов
  const fetchGroups = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/variants/groups${!showInactive ? "?active=true" : ""}`)
      if (!response.ok) {
        throw new Error("Ошибка при загрузке групп вариантов")
      }
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      console.error("Error fetching variant groups:", error)
      toast.error("Не удалось загрузить группы вариантов")
    } finally {
      setIsLoading(false)
    }
  }

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

      // Сортируем варианты по числовому порядку
      const sortedVariants = [...data.variants].sort(sortVariantsByNumber)
      setVariants(sortedVariants)

      setActiveTab("variants")
    } catch (error) {
      console.error("Error fetching variants:", error)
      toast.error("Не удалось загрузить варианты")
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchGroups()
  }, [showInactive])

  // Обработчики для групп вариантов
  const handleCreateGroup = async () => {
    try {
      if (!groupForm.title) {
        toast.error("Название группы обязательно")
        return
      }

      const response = await fetch("/api/variants/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupForm),
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при создании группы вариантов")
      }

      const newGroup = await response.json()
      toast.success("Группа вариантов создана")
      setIsGroupDialogOpen(false)

      // Спрашиваем пользователя, хочет ли он сразу добавить варианты
      const wantToAddVariants = window.confirm("Хотите добавить варианты в эту группу?")
      if (wantToAddVariants) {
        setSelectedGroup(newGroup)
        setIsBulkDialogOpen(true)
      } else {
        fetchGroups()
      }

      resetGroupForm()
    } catch (error) {
      console.error("Error creating variant group:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось создать группу вариантов")
    }
  }

  const handleUpdateGroup = async () => {
    try {
      if (!editingGroup || !groupForm.title) {
        toast.error("Название группы обязательно")
        return
      }

      const response = await fetch(`/api/variants/groups/${editingGroup.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupForm),
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при обновлении группы вариантов")
      }

      toast.success("Группа вариантов обновлена")
      setIsGroupDialogOpen(false)
      fetchGroups()

      // Если обновляли выбранную группу, обновляем её данные
      if (selectedGroup && selectedGroup.id === editingGroup.id) {
        fetchVariants(editingGroup.id)
      }

      resetGroupForm()
    } catch (error) {
      console.error("Error updating variant group:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось обновить группу вариантов")
    }
  }

  const handleDeleteGroup = async (groupId: number) => {
    try {
      const response = await fetch(`/api/variants/groups/${groupId}`, {
        method: "DELETE",
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при удалении группы вариантов")
      }

      toast.success("Группа вариантов удалена")
      fetchGroups()

      // Если удалили выбранную группу, сбрасываем выбор
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(null)
        setVariants([])
        setActiveTab("groups")
      }
    } catch (error) {
      console.error("Error deleting variant group:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось удалить группу вариантов")
    }
  }

  // Обработчики для вариантов
  const handleCreateVariant = async () => {
    try {
      if (!variantForm.title || !selectedGroup) {
        toast.error("Название варианта обязательно")
        return
      }

      const response = await fetch("/api/variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...variantForm,
          groupId: selectedGroup.id,
        }),
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при создании варианта")
      }

      toast.success("Вариант создан")
      setIsVariantDialogOpen(false)
      fetchVariants(selectedGroup.id)
      resetVariantForm()
    } catch (error) {
      console.error("Error creating variant:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось создать вариант")
    }
  }

  // Обработчик для массового создания вариантов
  const handleCreateBulkVariants = async () => {
    try {
      if (!bulkVariantsText.trim() || !selectedGroup) {
        toast.error("Список вариантов не может быть пустым")
        return
      }

      // Разбиваем текст на строки и фильтруем пустые строки
      const variantTitles = bulkVariantsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      if (variantTitles.length === 0) {
        toast.error("Список вариантов не может быть пустым")
        return
      }

      // Создаем варианты последовательно
      let createdCount = 0
      for (const title of variantTitles) {
        const response = await fetch("/api/variants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description: "",
            groupId: selectedGroup.id,
          }),
          credentials: "include",
        })

        if (response.ok) {
          createdCount++
        }
      }

      if (createdCount > 0) {
        toast.success(`Создано ${createdCount} вариантов`)
        setIsBulkDialogOpen(false)
        setBulkVariantsText("")
        fetchVariants(selectedGroup.id)
      } else {
        toast.error("Не удалось создать варианты")
      }
    } catch (error) {
      console.error("Error creating bulk variants:", error)
      toast.error("Не удалось создать варианты")
    }
  }

  const handleUpdateVariant = async () => {
    try {
      if (!editingVariant || !variantForm.title) {
        toast.error("Название варианта обязательно")
        return
      }

      const response = await fetch(`/api/variants/${editingVariant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variantForm),
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при обновлении варианта")
      }

      toast.success("Вариант обновлен")
      setIsVariantDialogOpen(false)

      if (selectedGroup) {
        fetchVariants(selectedGroup.id)
      }

      resetVariantForm()
    } catch (error) {
      console.error("Error updating variant:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось обновить вариант")
    }
  }

  const handleDeleteVariant = async (variantId: number) => {
    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: "DELETE",
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при удалении варианта")
      }

      toast.success("Вариант удален")

      if (selectedGroup) {
        fetchVariants(selectedGroup.id)
      }
    } catch (error) {
      console.error("Error deleting variant:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось удалить вариант")
    }
  }

  const handleResetVariant = async (variant: WorkVariant) => {
    try {
      const response = await fetch(`/api/variants/${variant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOccupied: false,
          studentName: null,
        }),
        credentials: "include", // Важно для отправки куки с токеном
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при сбросе варианта")
      }

      toast.success("Вариант сброшен")

      if (selectedGroup) {
        fetchVariants(selectedGroup.id)
      }
    } catch (error) {
      console.error("Error resetting variant:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось сбросить вариант")
    }
  }

  // Вспомогательные функции
  const resetGroupForm = () => {
    setGroupForm({
      title: "",
      description: "",
      isActive: true,
    })
    setEditingGroup(null)
  }

  const resetVariantForm = () => {
    setVariantForm({
      title: "",
      description: "",
      groupId: selectedGroup ? selectedGroup.id : 0,
    })
    setEditingVariant(null)
  }

  const openGroupDialog = (group?: WorkVariantGroup) => {
    if (group) {
      setEditingGroup(group)
      setGroupForm({
        title: group.title,
        description: group.description || "",
        isActive: group.isActive,
      })
    } else {
      resetGroupForm()
    }
    setIsGroupDialogOpen(true)
  }

  const openVariantDialog = (variant?: WorkVariant) => {
    if (variant) {
      setEditingVariant(variant)
      setVariantForm({
        title: variant.title,
        description: variant.description,
        groupId: variant.groupId,
      })
    } else {
      resetVariantForm()
    }
    setIsVariantDialogOpen(true)
  }

  const openBulkDialog = () => {
    setBulkVariantsText("")
    setIsBulkDialogOpen(true)
  }

  const handleBackToGroups = () => {
    setActiveTab("groups")
    setSelectedGroup(null)
    setVariants([])
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="admin-variants-container">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <TabsList className="mb-2 sm:mb-0">
            <TabsTrigger value="groups" onClick={handleBackToGroups} className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Группы вариантов</span>
            </TabsTrigger>
            {selectedGroup && (
              <TabsTrigger value="variants" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Варианты</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "groups" && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                  <Label htmlFor="show-inactive" className="text-sm whitespace-nowrap">
                    Показать неактивные
                  </Label>
                </div>
                <Button onClick={() => openGroupDialog()} size="sm" className="whitespace-nowrap">
                  <Plus className="mr-1 h-4 w-4" /> Добавить группу
                </Button>
              </>
            )}

            {activeTab === "variants" && selectedGroup && (
              <div className="flex gap-2">
                <Button onClick={openBulkDialog} size="sm" variant="outline" className="whitespace-nowrap">
                  <List className="mr-1 h-4 w-4" /> Добавить списком
                </Button>
                <Button onClick={() => openVariantDialog()} size="sm" className="whitespace-nowrap">
                  <Plus className="mr-1 h-4 w-4" /> Добавить вариант
                </Button>
              </div>
            )}
          </div>
        </div>

        <TabsContent value="groups" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Группы вариантов работ</CardTitle>
              <CardDescription>Управление группами вариантов для лабораторных и практических работ</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {showInactive
                    ? "Нет групп вариантов. Создайте новую группу."
                    : "Нет активных групп вариантов. Создайте новую группу или включите отображение неактивных групп."}
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <Card key={group.id} className="overflow-hidden hover:shadow-sm transition-all">
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{group.title}</h3>
                              {!group.isActive && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Неактивна
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchVariants(group.id)}
                                className="flex items-center gap-1"
                              >
                                <Users className="h-4 w-4" />
                                <span>Варианты ({group.variants.length})</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openGroupDialog(group)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Удаление группы вариантов</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Вы уверены, что хотите удалить группу "{group.title}"? Это действие нельзя
                                      отменить. Все варианты в этой группе также будут удалены.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteGroup(group.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {group.description && (
                            <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{group.description}</div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <div className="text-xs text-muted-foreground">Создана: {formatDate(group.createdAt)}</div>
                            <div className="text-xs text-muted-foreground">
                              Обновлена: {formatDate(group.updatedAt)}
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="text-sm flex items-center gap-2">
                              <span className="font-medium">Статистика:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  {group.variants.filter((v) => v.isOccupied).length} из {group.variants.length}{" "}
                                  вариантов занято
                                </span>
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{
                                      width: `${
                                        group.variants.length > 0
                                          ? (
                                              group.variants.filter((v) => v.isOccupied).length / group.variants.length
                                            ) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="mt-0">
          {selectedGroup && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{selectedGroup.title}</CardTitle>
                      {!selectedGroup.isActive && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Неактивна
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      Управление вариантами в группе • {variants.filter((v) => v.isOccupied).length} из{" "}
                      {variants.length} занято
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleBackToGroups} className="mt-2 sm:mt-0">
                    <FileText className="mr-1 h-4 w-4" /> К списку групп
                  </Button>
                </div>
                {selectedGroup.description && (
                  <div className="mt-2 text-sm border-l-2 border-muted pl-3 py-1">
                    <MarkdownRenderer content={selectedGroup.description} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : variants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет вариантов в этой группе. Добавьте новый вариант.
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-4">
                      {variants.map((variant) => (
                        <Card
                          key={variant.id}
                          className={`overflow-hidden transition-all ${
                            variant.isOccupied ? "border-primary/40 bg-primary/5 shadow-sm" : ""
                          }`}
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
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <Button variant="ghost" size="icon" onClick={() => openVariantDialog(variant)}>
                                  <Edit className="h-4 w-4" />
                                </Button>

                                {variant.isOccupied && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <X className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Сброс варианта</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Вы уверены, что хотите сбросить вариант "{variant.title}"? Информация о
                                          студенте будет удалена, но вариант останется в системе.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleResetVariant(variant)}>
                                          Сбросить
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Удаление варианта</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Вы уверены, что хотите удалить вариант "{variant.title}"? Это действие нельзя
                                        отменить.
                                        {variant.isOccupied && " Этот вариант занят студентом."}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteVariant(variant.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Удалить
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            {variant.description && (
                              <div className="mt-3">
                                <MarkdownRenderer content={variant.description} />
                              </div>
                            )}

                            {variant.isOccupied && variant.studentName && (
                              <div className="mt-4 p-3 bg-background rounded-md border border-primary/20 shadow-sm">
                                <div className="text-sm font-medium text-muted-foreground">Занят студентом:</div>
                                <div className="text-base font-medium mt-1">{variant.studentName}</div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог для создания/редактирования группы вариантов */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Редактирование группы вариантов" : "Создание группы вариантов"}</DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Измените информацию о группе вариантов"
                : "Заполните информацию для создания новой группы вариантов"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-title">Название группы *</Label>
              <Input
                id="group-title"
                value={groupForm.title}
                onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
                placeholder="Например: Презентация по Биологии"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Описание (поддерживается Markdown)</Label>
              <Textarea
                id="group-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                placeholder="Описание группы вариантов..."
                rows={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="group-active"
                checked={groupForm.isActive}
                onCheckedChange={(checked) => setGroupForm({ ...groupForm, isActive: checked })}
              />
              <Label htmlFor="group-active">Активна</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}>
              {editingGroup ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для создания/редактирования варианта */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Редактирование варианта" : "Создание варианта"}</DialogTitle>
            <DialogDescription>
              {editingVariant ? "Измените информацию о варианте" : "Заполните информацию для создания нового варианта"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variant-title">Название/номер варианта *</Label>
              <Input
                id="variant-title"
                value={variantForm.title}
                onChange={(e) => setVariantForm({ ...variantForm, title: e.target.value })}
                placeholder="Например: Вариант 1 или Тема: Алгоритмы сортировки"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-description">Описание (поддерживается Markdown)</Label>
              <Textarea
                id="variant-description"
                value={variantForm.description}
                onChange={(e) => setVariantForm({ ...variantForm, description: e.target.value })}
                placeholder="Описание варианта..."
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={editingVariant ? handleUpdateVariant : handleCreateVariant}>
              {editingVariant ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для массового создания вариантов */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавление вариантов списком</DialogTitle>
            <DialogDescription>
              Введите список вариантов, каждый с новой строки. Например:
              <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                1. Тема: Клеточная теория{"\n"}
                2. Тема: Фотосинтез{"\n"}
                3. Тема: Генетика
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-variants" className="flex items-center justify-between">
                <span>Список вариантов (каждый с новой строки) *</span>
                <span className="text-xs text-muted-foreground">
                  {bulkVariantsText.split("\n").filter((line) => line.trim().length > 0).length} вариантов
                </span>
              </Label>
              <Textarea
                id="bulk-variants"
                value={bulkVariantsText}
                onChange={(e) => setBulkVariantsText(e.target.value)}
                placeholder="1. Тема такая
2. Тема сякая
3. Тема третья"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreateBulkVariants}
              disabled={bulkVariantsText.split("\n").filter((line) => line.trim().length > 0).length === 0}
            >
              Создать варианты
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
