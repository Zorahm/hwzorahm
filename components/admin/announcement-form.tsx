"use client"

import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { announcementFormSchema } from "@/lib/validations/announcement"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"

interface AnnouncementFormProps {
  announcement?: {
    title: string
    content: string
    startDate?: Date
    endDate?: Date
  }
  onCancel: () => void
  onSubmit: (values: z.infer<typeof announcementFormSchema>) => void
}

export function AnnouncementForm({ announcement, onCancel, onSubmit }: AnnouncementFormProps) {
  const { toast } = useToast()
  const [startDate, setStartDate] = useState<Date | undefined>(announcement?.startDate)
  const [endDate, setEndDate] = useState<Date | undefined>(announcement?.endDate)
  const [hasEndDate, setHasEndDate] = useState(!!announcement?.endDate)

  const form = useForm<z.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      startDate: announcement?.startDate,
      endDate: announcement?.endDate,
    },
  })

  function handleDateChange(date: Date | undefined) {
    setStartDate(date)
    form.setValue("startDate", date)
  }

  function handleEndDateChange(date: Date | undefined) {
    setEndDate(date)
    form.setValue("endDate", date)
  }

  function onSubmitHandler(values: z.infer<typeof announcementFormSchema>) {
    if (startDate) {
      values.startDate = startDate
    }
    if (hasEndDate && endDate) {
      values.endDate = endDate
    } else {
      values.endDate = undefined
    }

    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{announcement ? "Редактировать объявление" : "Создать объявление"}</CardTitle>
            <CardDescription>
              Заполните форму ниже, чтобы {announcement ? "изменить" : "создать"} объявление.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите заголовок объявления" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Содержание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Введите содержание объявления" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Дата начала</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: ru }) : "Выберите дату начала"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <Switch id="has-end-date" checked={hasEndDate} onCheckedChange={setHasEndDate} />
                <Label htmlFor="has-end-date">Указать дату окончания</Label>
              </div>

              {hasEndDate && (
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: ru }) : "Выберите дату окончания"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setEndDate(date)}
                        initialFocus
                        disabled={(date) => {
                          // Нельзя выбрать дату раньше даты начала
                          return startDate ? date < startDate : false
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Отмена
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {announcement ? "Сохранить изменения" : "Создать объявление"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

import { Label } from "@/components/ui/label"
