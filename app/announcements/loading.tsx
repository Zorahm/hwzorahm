import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellRing } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnnouncementsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <Card className="announcement-section">
        <CardHeader className="announcement-header">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 shadow-md">
              <BellRing className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl">Объявления</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Важная информация и уведомления для студентов
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="urgent">Срочные</TabsTrigger>
              <TabsTrigger value="high">Важные</TabsTrigger>
              <TabsTrigger value="normal">Обычные</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Skeleton className="h-6 w-48" />
                          <div className="flex gap-2 items-center">
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
