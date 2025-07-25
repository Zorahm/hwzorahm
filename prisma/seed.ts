import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Создаем пользователей без использования bcrypt
  await prisma.user.upsert({
    where: { email: "admin" },
    update: {},
    create: {
      email: "admin",
      password: "ioBFjYOACC6f2r44", // Новый пароль
      role: "admin",
    },
  })

  await prisma.user.upsert({
    where: { email: "student@college.ru" },
    update: {},
    create: {
      email: "student@college.ru",
      password: "student123",
      role: "student",
    },
  })

  // Получаем текущую дату
  const today = new Date()

  // Создаем недели
  const week1 = await prisma.week.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Неделя 1",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8),
      status: "past",
    },
  })

  const week2 = await prisma.week.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Неделя 2",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      status: "past",
    },
  })

  const week3 = await prisma.week.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Неделя 3",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
      status: "current",
    },
  })

  const week4 = await prisma.week.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: "Неделя 4",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 13),
      status: "future",
    },
  })

  // Создаем расписание для текущей недели
  const scheduleItems = [
    // Понедельник
    {
      weekId: week3.id,
      day: "Понедельник",
      slot: 1,
      subject: "Математика",
      teacher: "Иванов И.И.",
      room: "301",
      customTime: false,
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Понедельник",
      slot: 2,
      subject: "Физика",
      teacher: "Петров П.П.",
      room: "205",
      customTime: false,
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Понедельник",
      slot: 3,
      subject: "Информатика",
      teacher: "Сидоров С.С.",
      room: "404",
      customTime: false,
      isSkipped: false,
    },
    // Вторник
    {
      weekId: week3.id,
      day: "Вторник",
      slot: 1,
      subject: "История",
      teacher: "Смирнова А.А.",
      room: "102",
      customTime: false,
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Вторник",
      slot: 2,
      subject: "Английский язык",
      teacher: "Козлова Е.Е.",
      room: "203",
      customTime: false,
      isSkipped: false,
    },
    // Среда
    {
      weekId: week3.id,
      day: "Среда",
      slot: 1,
      subject: "Программирование",
      teacher: "Сидоров С.С.",
      room: "404",
      customTime: true,
      startTime: "09:00",
      endTime: "10:30",
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Среда",
      slot: 2,
      subject: "Базы данных",
      teacher: "Сидоров С.С.",
      room: "404",
      customTime: false,
      isSkipped: false,
    },
    // Четверг
    {
      weekId: week3.id,
      day: "Четверг",
      slot: 1,
      subject: "Физкультура",
      teacher: "Морозов Д.Д.",
      room: "Спортзал",
      customTime: false,
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Четверг",
      slot: 2,
      subject: "Литература",
      teacher: "Николаева Г.Г.",
      room: "101",
      customTime: false,
      isSkipped: false,
    },
    // Пятница
    {
      weekId: week3.id,
      day: "Пятница",
      slot: 1,
      subject: "Химия",
      teacher: "Васильева О.О.",
      room: "305",
      customTime: false,
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Пятница",
      slot: 2,
      subject: "Биология",
      teacher: "Кузнецова Т.Т.",
      room: "307",
      customTime: false,
      isSkipped: false,
    },
    {
      weekId: week3.id,
      day: "Пятница",
      slot: 3,
      subject: "Физика",
      teacher: "Петров П.П.",
      room: "205",
      customTime: false,
      isSkipped: true,
    },
  ]

  for (const item of scheduleItems) {
    await prisma.schedule.create({
      data: item,
    })
  }

  // Создаем домашние задания
  const homeworkItems = [
    {
      weekId: week3.id,
      subject: "Математика",
      description: "Решить задачи 1-5 из учебника, стр. 42",
      deadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 23, 59, 59),
      fileUrl: "/uploads/math_homework.pdf",
    },
    {
      weekId: week3.id,
      subject: "Физика",
      description: "Подготовить доклад по теме 'Электромагнитные волны'",
      deadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 23, 59, 59),
    },
    {
      weekId: week3.id,
      subject: "Информатика",
      description: "Выполнить лабораторную работу №3",
      deadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 23, 59, 59),
      fileUrl: "/uploads/lab3.docx",
    },
    {
      weekId: week3.id,
      subject: "История",
      description: "Прочитать главу 5, ответить на вопросы в конце главы",
      deadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59),
    },
  ]

  for (const item of homeworkItems) {
    await prisma.homework.create({
      data: item,
    })
  }

  // Создаем экзамены с новыми полями
  const examItems = [
    {
      weekId: week4.id,
      subject: "Математика",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 9, 0, 0),
      room: "301",
      notes: "Принести калькулятор и линейку",
      theoryContent: `
## Теоретическая часть экзамена по математике

### Темы для подготовки:

1. **Дифференциальное исчисление**
   - Производные элементарных функций
   - Правила дифференцирования
   - Применение производной к исследованию функций

2. **Интегральное исчисление**
   - Неопределенный интеграл и его свойства
   - Методы интегрирования
   - Определенный интеграл и его приложения

3. **Линейная алгебра**
   - Матрицы и определители
   - Системы линейных уравнений
   - Векторы и действия с ними

### Примеры формул:

Формула Тейлора: $f(x) = f(a) + f'(a)(x-a) + \\frac{f''(a)}{2!}(x-a)^2 + ... + \\frac{f^{(n)}(a)}{n!}(x-a)^n + R_n(x)$

Интеграл по частям: $\\int u(x)v'(x)dx = u(x)v(x) - \\int u'(x)v(x)dx$

Формула Ньютона-Лейбница: $\\int_{a}^{b} f(x)dx = F(b) - F(a)$
      `,
      practiceContent: `
## Практическая часть экзамена по математике

### Задачи для подготовки:

1. **Задача на нахождение производной**
   
   Найти производную функции $f(x) = x^3\\ln(x) - \\frac{\\sin(x)}{\\sqrt{x+1}}$

2. **Задача на интегрирование**
   
   Вычислить интеграл $\\int \\frac{x^2+1}{x^3+3x} dx$

3. **Задача на исследование функции**
   
   Исследовать функцию $f(x) = x^3 - 3x^2 + 3$ и построить ее график.

4. **Задача на решение дифференциального уравнения**
   
   Решить дифференциальное уравнение $y' + 2y = e^{-2x}$

### Критерии оценки:

- Правильность решения
- Полнота обоснования
- Аккуратность оформления
      `,
      files: {
        create: [
          {
            filename: "Формулы_для_экзамена.pdf",
            fileUrl: "/uploads/math_formulas.pdf",
          },
          {
            filename: "Примеры_решения_задач.pdf",
            fileUrl: "/uploads/math_examples.pdf",
          },
        ],
      },
    },
    {
      weekId: week4.id,
      subject: "Физика",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15, 9, 0, 0),
      room: "205",
      notes: "Разрешены справочные материалы",
      theoryContent: `
## Теоретическая часть экзамена по физике

### Темы для подготовки:

1. **Механика**
   - Кинематика материальной точки
   - Динамика. Законы Ньютона
   - Законы сохранения в механике

2. **Электродинамика**
   - Электростатическое поле
   - Постоянный электрический ток
   - Магнитное поле

3. **Оптика**
   - Геометрическая оптика
   - Волновая оптика
   - Квантовая оптика

### Основные формулы:

Второй закон Ньютона: $\\vec{F} = m\\vec{a}$

Закон Кулона: $F = k\\frac{|q_1 q_2|}{r^2}$

Закон Ома для участка цепи: $I = \\frac{U}{R}$

Формула тонкой линзы: $\\frac{1}{F} = \\frac{1}{d} + \\frac{1}{f}$
      `,
      practiceContent: `
## Практическая часть экзамена по физике

### Задачи для подготовки:

1. **Задача на применение законов механики**
   
   Тело массой 2 кг брошено вертикально вверх с начальной скоростью 20 м/с. Определить максимальную высоту подъема и время движения до возвращения в исходную точку. Сопротивлением воздуха пренебречь.

2. **Задача на расчет электрической цепи**
   
   Определить силу тока в цепи, содержащей последовательно соединенные резистор сопротивлением 5 Ом и конденсатор емкостью 200 мкФ, если к цепи приложено переменное напряжение с амплитудой 220 В и частотой 50 Гц.

3. **Задача на применение законов оптики**
   
   Предмет находится на расстоянии 15 см от собирающей линзы с фокусным расстоянием 10 см. Определить положение и характер изображения.

### Требования к оформлению решения:

- Запись исходных данных и искомых величин
- Запись основных формул
- Подробное решение с пояснениями
- Проверка размерности полученного результата
      `,
      files: {
        create: [
          {
            filename: "Справочник_по_физике.pdf",
            fileUrl: "/uploads/physics_handbook.pdf",
          },
        ],
      },
    },
    {
      weekId: week3.id,
      subject: "Информатика",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 0, 0),
      room: "404",
      notes: "Практическое задание на компьютере",
      theoryContent: `
## Теоретическая часть экзамена по информатике

### Темы для подготовки:

1. **Алгоритмы и структуры данных**
   - Основные алгоритмические конструкции
   - Массивы, списки, деревья, графы
   - Алгоритмы сортировки и поиска

2. **Базы данных**
   - Реляционная модель данных
   - Язык SQL
   - Нормализация баз данных

3. **Компьютерные сети**
   - Модель OSI
   - Протоколы TCP/IP
   - Основы сетевой безопасности

### Примеры кода:

\`\`\`python
def binary_search(arr, x):
    low = 0
    high = len(arr) - 1
    mid = 0
 
    while low <= high:
        mid = (high + low) // 2
        if arr[mid] < x:
            low = mid + 1
        elif arr[mid] > x:
            high = mid - 1
        else:
            return mid
    return -1
\`\`\`

\`\`\`sql
SELECT students.name, AVG(grades.score) as average_score
FROM students
JOIN grades ON students.id = grades.student_id
GROUP BY students.id
HAVING AVG(grades.score) > 4.5
ORDER BY average_score DESC;
\`\`\`
      `,
      practiceContent: `
## Практическая часть экзамена по информатике

### Задания для подготовки:

1. **Задание на программирование**
   
   Написать программу, которая находит все простые числа в заданном диапазоне и выводит их на экран.

2. **Задание по базам данных**
   
   Создать базу данных "Библиотека" с таблицами "Книги", "Авторы", "Читатели", "Выдачи". Реализовать запросы:
   - Список книг, которые не возвращены более месяца
   - Самые популярные авторы (по количеству выдач их книг)
   - Читатели, которые брали более 5 книг за последний год

3. **Задание по компьютерным сетям**
   
   Настроить локальную сеть из трех компьютеров с разными IP-адресами. Обеспечить доступ к общим ресурсам и защиту от несанкционированного доступа.

### Критерии оценки:

- Корректность работы программы/запроса/настройки
- Оптимальность решения
- Соблюдение стандартов и лучших практик
- Документирование кода
      `,
      files: {
        create: [
          {
            filename: "Примеры_алгоритмов.py",
            fileUrl: "/uploads/algorithms.py",
          },
          {
            filename: "SQL_шпаргалка.pdf",
            fileUrl: "/uploads/sql_cheatsheet.pdf",
          },
        ],
      },
    },
    {
      weekId: week4.id,
      subject: "История",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20, 9, 0, 0),
      room: "102",
      theoryContent: `
## Теоретическая часть экзамена по истории

### Темы для подготовки:

1. **Древний мир**
   - Цивилизации Древнего Востока
   - Античная Греция
   - Древний Рим

2. **Средние века**
   - Византийская империя
   - Западная Европа в Средние века
   - Древняя Русь и образование Российского государства

3. **Новое время**
   - Великие географические открытия
   - Реформация и Контрреформация
   - Россия в XVII-XIX веках

4. **Новейшее время**
   - Первая мировая война
   - Революция и Гражданская война в России
   - Вторая мировая война
   - Холодная война
   - Современная Россия

### Ключевые даты:

- 862 г. - призвание варягов
- 988 г. - Крещение Руси
- 1242 г. - Ледовое побоище
- 1380 г. - Куликовская битва
- 1613 г. - начало правления династии Романовых
- 1812 г. - Отечественная война
- 1861 г. - отмена крепостного права
- 1917 г. - Февральская и Октябрьская революции
- 1941-1945 гг. - Великая Отечественная война
- 1991 г. - распад СССР
      `,
      practiceContent: `
## Практическая часть экзамена по истории

### Задания для подготовки:

1. **Работа с историческими источниками**
   
   Проанализировать отрывок из исторического документа, определить его автора, время создания, исторический контекст и значение.

2. **Историческое эссе**
   
   Написать эссе на одну из предложенных тем:
   - "Роль личности в истории на примере Петра I"
   - "Причины и последствия распада СССР"
   - "Влияние монголо-татарского ига на развитие Руси"

3. **Работа с исторической картой**
   
   По предложенной карте определить исторический период, основные события, их причины и последствия.

4. **Анализ исторических процессов**
   
   Сравнить особенности развития России и стран Западной Европы в XIX веке.

### Критерии оценки:

- Знание фактического материала
- Понимание причинно-следственных связей
- Умение аргументировать свою позицию
- Корректное использование исторических терминов
      `,
      files: {
        create: [
          {
            filename: "Хронология_ключевых_событий.pdf",
            fileUrl: "/uploads/history_timeline.pdf",
          },
          {
            filename: "Исторические_карты.pdf",
            fileUrl: "/uploads/historical_maps.pdf",
          },
        ],
      },
    },
  ]

  for (const item of examItems) {
    await prisma.exam.create({
      data: item,
    })
  }

  console.log("Seed data created successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
