import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    if (!prisma) {
      throw new Error("Prisma client не инициализирован")
    }

    const students = await prisma.student.findMany({
      where: { isActive: true },
      orderBy: [
        { position: "desc" }, // Староста сначала
        { name: "asc" },
      ],
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Ошибка при загрузке студентов" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    // Проверяем подключение к базе данных
    if (!prisma) {
      throw new Error("Prisma client не инициализирован")
    }

    const data = await request.json()

    // Проверяем, существует ли уже студент с таким email
    const existingStudent = await prisma.student.findUnique({
      where: { email: data.email },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Студент с таким email уже существует" }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: {
        name: data.name,
        position: data.position,
        responsibility: data.responsibility,
        email: data.email,
        phone: data.phone || null,
        telegram: data.telegram || null,
        avatar: data.avatar || null,
        year: data.year,
        gpa: data.gpa || null,
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Студент с таким email уже существует" }, { status: 400 })
    }
    return NextResponse.json({ error: "Ошибка при создании студента" }, { status: 500 })
  }
}
