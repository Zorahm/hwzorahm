"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  // Начальное значение false для предотвращения несоответствия SSR/CSR
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Используем matchMedia вместо innerWidth для более надежного определения
    const mediaQuery = window.matchMedia("(max-width: 768px)")

    // Функция для проверки размера экрана
    const checkMobile = () => {
      setIsMobile(mediaQuery.matches)
    }

    // Инициализация при монтировании
    checkMobile()

    // Используем правильный метод в зависимости от поддержки браузера
    const handler = () => checkMobile()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler)
    } else {
      // Для старых браузеров
      mediaQuery.addListener(handler)
    }

    // Очистка при размонтировании
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler)
      } else {
        // Для старых браузеров
        mediaQuery.removeListener(handler)
      }
    }
  }, [])

  return isMobile
}

// Хук для определения очень маленьких экранов
export function useVerySmallScreen(breakpoint = 480) {
  const [isVerySmall, setIsVerySmall] = useState(false)

  useEffect(() => {
    // Используем matchMedia вместо innerWidth
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)

    const checkScreenSize = () => {
      setIsVerySmall(mediaQuery.matches)
    }

    // Инициализация
    checkScreenSize()

    // Используем правильный метод в зависимости от поддержки браузера
    const handler = () => checkScreenSize()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler)
    } else {
      // Для старых браузеров
      mediaQuery.addListener(handler)
    }

    // Очистка
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler)
      } else {
        // Для старых браузеров
        mediaQuery.removeListener(handler)
      }
    }
  }, [breakpoint])

  return isVerySmall
}
