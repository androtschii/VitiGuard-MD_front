import { useTranslation } from 'react-i18next'
import type { RiskLevel } from '@/api/risks'
import { cn } from '@/lib/cn'

// Цвета уровней зарезервированы за риском и не используются для серий
// графиков; уровень всегда подписан словом и значком, а не только цветом
const STYLES: Record<RiskLevel, string> = {
  low: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  medium:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  high: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
}

const ICONS: Record<RiskLevel, string> = {
  // Галочка, восклицательный знак в треугольнике, восклицательный знак в круге
  low: 'M3.5 8.5l3 3 6-7',
  medium: 'M8 2l6.5 11.5h-13zM8 6.5v3.5M8 12v.01',
  high: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 4.5v4.5M8 11.5v.01',
}

type RiskBadgeProps = {
  level: RiskLevel
  label?: string
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        STYLES[level],
      )}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ICONS[level]} />
      </svg>
      {label ? `${label}: ` : ''}
      {t(`risk.levels.${level}`)}
    </span>
  )
}
