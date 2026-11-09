import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { cn } from '@/lib/cn'

const TABS = [
  { href: '/diagnosis', labelKey: 'vine.tabs.leaf' },
  { href: '/diagnosis/vine', labelKey: 'vine.tabs.row' },
] as const

// Что проверяем: отдельный лист или ряд лозы целиком
export function DiagnosisTabs() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('vine.tabs.label')}
      className="mb-4 inline-flex rounded-lg border border-line bg-muted/60 p-1"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.href}
          to={tab.href}
          end
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )
          }
        >
          {t(tab.labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
