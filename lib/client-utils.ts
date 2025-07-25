/**
 * Проверяет, выполняется ли код в браузере
 */
export const isBrowser = typeof window !== "undefined"

/**
 * Безопасно возвращает объект window или null
 */
export const getWindow = () => (isBrowser ? window : null)

/**
 * Безопасно возвращает объект document или null
 */
export const getDocument = () => (isBrowser ? document : null)

/**
 * Безопасно возвращает объект location или null
 */
export const getLocation = () => (isBrowser ? window.location : null)

/**
 * Безопасно возвращает объект localStorage или null
 */
export const getLocalStorage = () => (isBrowser ? window.localStorage : null)

/**
 * Безопасно возвращает объект sessionStorage или null
 */
export const getSessionStorage = () => (isBrowser ? window.sessionStorage : null)

/**
 * Безопасно возвращает текущий путь (pathname) или пустую строку
 */
export const getPathname = () => (isBrowser ? window.location.pathname : "")

/**
 * Безопасно возвращает текущий URL или пустую строку
 */
export const getCurrentUrl = () => (isBrowser ? window.location.href : "")

/**
 * Безопасно проверяет, соответствует ли текущий путь указанному
 */
export const isCurrentPath = (path: string) => getPathname() === path

/**
 * Форматирует дату в локализованный формат
 * @param dateString Строка с датой или объект Date
 * @param options Опции форматирования
 * @returns Отформатированная строка даты
 */
export const formatDate = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string => {
  if (!dateString) return ""

  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  // Проверка на валидность даты
  if (isNaN(date.getTime())) return "Некорректная дата"

  return date.toLocaleDateString("ru-RU", options)
}
