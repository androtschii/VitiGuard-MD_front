import type { ComponentProps } from 'react'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'

// Кнопка удаления: при наведении у корзины открывается крышка, пока идёт
// удаление, корзина «съедает» подпись. Сама анимация и есть индикатор загрузки
export function DeleteButton({
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      variant="ghost"
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'delete-button text-danger [--fill-ink:var(--color-white)] [--fill:var(--color-red-700)]',
        className,
      )}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4 shrink-0 overflow-visible"
      >
        <path className="delete-lid" d="M2.5 4h11M6 4V2.5h4V4" />
        <path d="M4 4l.7 9.5h6.6L12 4M6.8 7v3.5M9.2 7v3.5" />
      </svg>
      <span className="delete-label">{children}</span>
    </Button>
  )
}
