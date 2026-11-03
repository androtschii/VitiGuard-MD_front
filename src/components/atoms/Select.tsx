import type { ComponentProps } from 'react'
import { controlStyles } from '@/components/atoms/controlStyles'
import { cn } from '@/lib/cn'

// Нативный <select>: с клавиатуры и экранными дикторами работает без доработок.
// Где браузер умеет appearance: base-select, список вариантов оформлен в цветах
// темы (класс select-themed в index.css), в остальных - системный. Стрелка
// рисуется поверх, потому что appearance-none убирает системную
export function Select({
  className,
  children,
  ...props
}: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlStyles,
          'select-themed peer h-10 appearance-none pr-9',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-subtle transition-transform peer-open:rotate-180 motion-safe:duration-150"
      >
        <path d="M5.2 7.5a.75.75 0 0 1 1.06 0L10 11.24l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.56a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </div>
  )
}
