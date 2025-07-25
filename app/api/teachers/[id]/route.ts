import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Проверка авторизации
    const user = await isAdmin(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Проверяем подключение к базе данных
    if (!prisma) {
      throw new Error("Prisma client не инициализирован");
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid teacher ID" }, { status: 400 });
    }

    // Проверяем, существует ли преподаватель
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });
    if (!existingTeacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log(`Received teacher update data for ID ${id}:`, body); // Для отладки

    const { name, email, subject, position, phone, office, schedule, experience, degree, avatar } = body;

    // Валидация обязательных полей
    if (!name || !position) {
      return NextResponse.json({ message: "Name and position are required" }, { status: 400 });
    }

    // Проверяем, требуется ли предмет для данной должности
    const isSubjectRequired = !["Куратор группы", "Заведующий кафедрой", "Декан", "Проректор", "Ректор"].includes(position);
    if (isSubjectRequired && !subject) {
      return NextResponse.json({ message: "Subject is required for this position" }, { status: 400 });
    }

    // Создаем объект данных только с заполненными полями
    const teacherData: any = {
      name,
      position,
      subject: subject || "",
      email: email || "",
    };

    // Добавляем опциональные поля только если они не пустые
    if (phone && phone.trim()) teacherData.phone = phone.trim();
    else teacherData.phone = null;
    if (office && office.trim()) teacherData.office = office.trim();
    else teacherData.office = null;
    if (schedule && schedule.trim()) teacherData.schedule = schedule.trim();
    else teacherData.schedule = null;
    if (experience && experience.trim()) teacherData.experience = experience.trim();
    else teacherData.experience = null;
    if (degree && degree.trim()) teacherData.degree = degree.trim();
    else teacherData.degree = null;
    if (avatar && avatar.trim()) teacherData.avatar = avatar.trim();
    else teacherData.avatar = null;

    console.log(`Updating teacher with ID ${id} with data:`, teacherData); // Для отладки

    const teacher = await prisma.teacher.update({
      where: { id },
      data: teacherData,
    });

    return NextResponse.json(teacher, { status: 200 });
  } catch (error) {
    console.error(`Error updating teacher with ID ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update teacher", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Проверка авторизации
    const user = await isAdmin(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Проверяем подключение к базе данных
    if (!prisma) {
      throw new Error("Prisma client не инициализирован");
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid teacher ID" }, { status: 400 });
    }

    // Проверяем, существует ли преподаватель
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });
    if (!existingTeacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    console.log(`Deleting teacher with ID ${id}`); // Для отладки

    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Teacher deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting teacher with ID ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete teacher", error: error.message }, { status: 500 });
  }
}