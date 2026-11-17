import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type StatTileProps = {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'high' | 'medium'
  // Порядковый номер плитки: плитки появляются одна за другой
  index?: number
}

// Цвет уровня: короткая полоска сверху и само число. Толстая рамка по
// верхнему краю спорила со скруглёнными углами плитки
const TONES = {
  high: {
    bar: 'bg-red-600 dark:bg-red-400',
    tile: '[&>dd:first-of-type]:text-danger',
  },
  medium: {
    bar: 'bg-amber-500',
    tile: '[&>dd:first-of-type]:text-amber-700 dark:[&>dd:first-of-type]:text-amber-300',
  },
}

// Плитка с одним числом для сводки на главной
export function StatTile({
  label,
  value,
  hint,
  tone,
  index = 0,
}: StatTileProps) {
  return (
    <div
      style={{ '--i': index } as React.CSSProperties}
      className={cn(
        'stagger flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 shadow-sm transition hover:shadow-md motion-safe:animate-rise motion-safe:hover:-translate-y-0.5',
        tone && TONES[tone].tile,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mb-1 h-1 w-8 rounded-full',
          tone ? TONES[tone].bar : 'bg-brand-500',
        )}
      />
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-2xl font-semibold text-ink tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-ink-subtle">{hint}</dd>}
    </div>
  )
}
