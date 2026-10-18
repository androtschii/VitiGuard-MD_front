import type { ReactNode } from 'react'

type StatTileProps = {
  label: string
  value: ReactNode
  hint?: string
}

// Плитка с одним числом для сводки на главной
export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 shadow-sm">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-2xl font-semibold text-ink tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-ink-subtle">{hint}</dd>}
    </div>
  )
}
