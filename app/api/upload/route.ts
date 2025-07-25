import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { isAdmin, forbidden } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Проверить, является ли пользователь администратором
    if (!(await isAdmin(request))) {
      return forbidden()
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("Upload error: No file provided")
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 })
    }

    // Проверить тип файла
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed",
    ]

    if (!allowedTypes.includes(file.type)) {
      console.error("Upload error: Invalid file type", file.type)
      return NextResponse.json({ error: "Неподдерживаемый тип файла" }, { status: 400 })
    }

    console.log("Processing file upload:", {
      name: file.name,
      type: file.type,
    })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создать директорию uploads, если она не существует
    const uploadDir = join(process.cwd(), "public", "uploads")

    try {
      await mkdir(uploadDir, { recursive: true })
      console.log("Upload directory ensured:", uploadDir)
    } catch (mkdirError) {
      console.error("Error creating upload directory:", mkdirError)
      return NextResponse.json({ error: "Ошибка создания директории" }, { status: 500 })
    }

    // Функция для транслитерации русских символов
    const transliterate = (text: string): string => {
      const translitMap: { [key: string]: string } = {
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ё: "yo",
        ж: "zh",
        з: "z",
        и: "i",
        й: "y",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "ts",
        ч: "ch",
        ш: "sh",
        щ: "sch",
        ъ: "",
        ы: "y",
        ь: "",
        э: "e",
        ю: "yu",
        я: "ya",
        А: "A",
        Б: "B",
        В: "V",
        Г: "G",
        Д: "D",
        Е: "E",
        Ё: "Yo",
        Ж: "Zh",
        З: "Z",
        И: "I",
        Й: "Y",
        К: "K",
        Л: "L",
        М: "M",
        Н: "N",
        О: "O",
        П: "P",
        Р: "R",
        С: "S",
        Т: "T",
        У: "U",
        Ф: "F",
        Х: "H",
        Ц: "Ts",
        Ч: "Ch",
        Ш: "Sh",
        Щ: "Sch",
        Ъ: "",
        Ы: "Y",
        Ь: "",
        Э: "E",
        Ю: "Yu",
        Я: "Ya",
        " ": "_",
        "-": "_",
        "(": "",
        ")": "",
        "[": "",
        "]": "",
        "{": "",
        "}": "",
        "!": "",
        "?": "",
        ",": "",
        ".": ".",
        ":": "",
        ";": "",
        '"': "",
        "'": "",
        "№": "N",
        "№": "N",
      }

      return text
        .split("")
        .map((char) => translitMap[char] || char)
        .join("")
    }

    // Разделить имя файла на имя и расширение
    const lastDotIndex = file.name.lastIndexOf(".")
    const fileName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name
    const fileExtension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : ""

    // Транслитерировать только имя файла, оставив расширение как есть
    const transliteratedName = transliterate(fileName)

    // Убрать лишние символы и множественные подчеркивания
    const cleanName = transliteratedName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")

    // Генерировать уникальное имя файла
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${cleanName}${fileExtension}`
    const filePath = join(uploadDir, uniqueFilename)

    console.log("File name processing:", {
      original: file.name,
      transliterated: transliteratedName,
      clean: cleanName,
      final: uniqueFilename,
    })

    // Записать файл
    try {
      await writeFile(filePath, buffer)
      console.log("File written successfully:", filePath)
    } catch (writeError) {
      console.error("Error writing file:", writeError)
      return NextResponse.json({ error: "Ошибка записи файла" }, { status: 500 })
    }

    // Вернуть URL файла
    const fileUrl = `/uploads/${uniqueFilename}`

    console.log("File upload completed successfully:", fileUrl)

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      savedAs: uniqueFilename,
    })
  } catch (error) {
    console.error("Unexpected error in upload API:", error)

    // Более детальная информация об ошибке
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка"
    const errorStack = error instanceof Error ? error.stack : "No stack trace"

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    })

    return NextResponse.json(
      {
        error: "Ошибка сервера при загрузке файла",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}
