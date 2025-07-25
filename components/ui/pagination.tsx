"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

const Pagination = ({
  className,
  currentPage,
  totalPages,
  onPageChange,
  ...props
}: React.ComponentProps<"nav"> & {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PaginationItem
            key={i}
            onClick={() => onPageChange(i)}
            aria-current={currentPage === i ? "page" : undefined}
            className={currentPage === i ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            {i}
          </PaginationItem>,
        )
      }
    } else {
      // Если страниц много, показываем текущую, первую, последнюю и соседние
      // Всегда показываем первую страницу
      pageNumbers.push(
        <PaginationItem
          key={1}
          onClick={() => onPageChange(1)}
          aria-current={currentPage === 1 ? "page" : undefined}
          className={currentPage === 1 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
        >
          1
        </PaginationItem>,
      )

      // Если текущая страница далеко от начала, показываем многоточие
      if (currentPage > 3) {
        pageNumbers.push(<PaginationEllipsis key="ellipsis-start" />)
      }

      // Показываем страницы вокруг текущей
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        if (i === 1 || i === totalPages) continue // Пропускаем первую и последнюю, они добавляются отдельно
        pageNumbers.push(
          <PaginationItem
            key={i}
            onClick={() => onPageChange(i)}
            aria-current={currentPage === i ? "page" : undefined}
            className={currentPage === i ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            {i}
          </PaginationItem>,
        )
      }

      // Если текущая страница далеко от конца, показываем многоточие
      if (currentPage < totalPages - 2) {
        pageNumbers.push(<PaginationEllipsis key="ellipsis-end" />)
      }

      // Всегда показываем последнюю страницу
      if (totalPages > 1) {
        pageNumbers.push(
          <PaginationItem
            key={totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-current={currentPage === totalPages ? "page" : undefined}
            className={currentPage === totalPages ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            {totalPages}
          </PaginationItem>,
        )
      }
    }

    return pageNumbers
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <PaginationContent>
        <PaginationPrevious
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
        />
        {renderPageNumbers()}
        <PaginationNext
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
        />
      </PaginationContent>
    </nav>
  )
}

const PaginationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex w-full items-center justify-center gap-2", className)} {...props} />
  },
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    return <Button ref={ref} variant="outline" className={cn("h-8 w-8 p-0", className)} {...props} />
  },
)
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
  ({ className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "sm",
          }),
          "h-8 w-8 border-input",
          className,
        )}
        {...props}
      />
    )
  },
)
PaginationLink.displayName = "PaginationLink"

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className, ...props }, ref) => {
    return (
      <span ref={ref} aria-hidden="true" className={cn("h-8 w-8 text-muted-foreground", className)} {...props}>
        <MoreHorizontal className="h-4 w-4" />
      </span>
    )
  },
)
PaginationEllipsis.displayName = "PaginationEllipsis"

const PaginationPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    return (
      <Button ref={ref} variant="outline" className={cn("h-8 w-8 p-0", className)} {...props}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Go to previous page</span>
      </Button>
    )
  },
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    return (
      <Button ref={ref} variant="outline" className={cn("h-8 w-8 p-0", className)} {...props}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Go to next page</span>
      </Button>
    )
  },
)
PaginationNext.displayName = "PaginationNext"

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
}
