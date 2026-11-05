import type { ReactNode } from 'react'

const ICONS = {
  // Колокольчик, лист, карта, лупа
  bell: 'M6 9a6 6 0 1 1 12 0c0 4.5 2 6 2 6H4s2-1.5 2-6M10 19a2 2 0 0 0 4 0',
  leaf: 'M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l7-7',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
} as const

type EmptyStateProps = {
  icon: keyof typeof ICONS
  title: string
  hint?: string
  action?: ReactNode
}

// Пустой список — не строка серого текста, а подсказка, что делать дальше
export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center motion-safe:animate-rise">
      <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ICONS[icon]} />
        </svg>
      </span>
      <p className="max-w-sm text-sm font-medium text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action}
    </div>
  )
}
