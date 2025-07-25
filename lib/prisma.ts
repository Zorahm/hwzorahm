import { PrismaClient } from "@prisma/client"

// Создаем глобальный объект Prisma для предотвращения множественных подключений
// в режиме разработки при горячей перезагрузке

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
