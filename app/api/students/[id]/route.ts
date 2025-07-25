import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)
    const data = await request.json()

    // Проверяем, существует ли другой студент с таким email
    const existingStudent = await prisma.student.findFirst({
      where: {
        email: data.email,
        NOT: { id: id },
      },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Студент с таким email уже существует" }, { status: 400 })
    }

    const student = await prisma.student.update({
      where: { id },
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

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error updating student:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Студент с таким email уже существует" }, { status: 400 })
    }
    return NextResponse.json({ error: "Ошибка при обновлении студента" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    await prisma.student.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ error: "Ошибка при удалении студента" }, { status: 500 })
  }
}
