import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Проверяем подключение к базе данных
    if (!prisma) {
      throw new Error("Prisma client не инициализирован");
    }

    const teachers = await prisma.teacher.findMany();
    console.log("Fetched teachers:", teachers); // Для отладки

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ message: "Failed to fetch teachers", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await isAdmin(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Проверяем подключение к базе данных
    if (!prisma) {
      throw new Error("Prisma client не инициализирован");
    }

    const body = await request.json();
    console.log("Received teacher data:", body); // Для отладки

    const { name, email, subject, position, phone, office, schedule, experience, degree, avatar } = body;

    if (!name || !position) {
      return NextResponse.json({ message: "Name and position are required" }, { status: 400 });
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
    if (office && office.trim()) teacherData.office = office.trim();
    if (schedule && schedule.trim()) teacherData.schedule = schedule.trim();
    if (experience && experience.trim()) teacherData.experience = experience.trim();
    if (degree && degree.trim()) teacherData.degree = degree.trim();
    if (avatar && avatar.trim()) teacherData.avatar = avatar.trim();

    console.log("Creating teacher with data:", teacherData); // Для отладки

    const teacher = await prisma.teacher.create({
      data: teacherData,
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ message: "Failed to create teacher", error: error.message }, { status: 500 });
  }
}