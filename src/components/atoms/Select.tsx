import type { ComponentProps } from 'react'
import { controlStyles } from '@/components/atoms/controlStyles'
import { cn } from '@/lib/cn'

// Нативный <select>: на телефонах открывается системным выбором, с клавиатуры
// и экранными дикторами работает без доработок. Стрелка рисуется поверх,
// потому что appearance-none убирает системную
export function Select({
  className,
  children,
  ...props
}: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(controlStyles, 'h-10 appearance-none pr-9', className)}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-500"
      >
        <path d="M5.2 7.5a.75.75 0 0 1 1.06 0L10 11.24l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.56a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </div>
  )
}
