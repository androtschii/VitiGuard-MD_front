import type { ComponentProps } from 'react'
import { Spinner } from '@/components/atoms/Spinner'
import { cn } from '@/lib/cn'

const variants = {
  primary: 'bg-brand-700 text-white [--fill:var(--color-brand-900)]',
  secondary: 'border border-line-strong bg-surface text-ink',
  ghost: 'fill-hover-soft text-ink-soft',
  danger: 'bg-red-700 text-white [--fill:var(--color-red-900)]',
}

const sizes = {
  // Минимальная, а не фиксированная высота: длинная подпись в узкой панели
  // переносится на вторую строку, и кнопка растёт, а не обрезает текст
  sm: 'min-h-8 gap-1.5 px-3 py-1 text-sm',
  md: 'min-h-10 gap-2 px-4 py-1.5 text-sm',
  lg: 'min-h-12 gap-2 px-6 py-2 text-base',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'fill-hover inline-flex items-center justify-center rounded-md text-center font-medium transition active:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}
