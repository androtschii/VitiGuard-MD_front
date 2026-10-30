import { useEffect, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { NavIcon } from '@/components/atoms/NavIcon'
import { cn } from '@/lib/cn'

export type NavItem = {
  label: string
  href: string
  current?: boolean
}

type SidebarProps = {
  items: NavItem[]
}

// Высота пункта (h-11) вместе с промежутком (gap-1)
const ITEM_REM = 3

// Каждая страница рисует колонку заново: подсветка едет с прежнего пункта,
// поэтому его номер живёт дольше самого компонента
let previousCurrent = -1

// Боковая колонка разделов на широком экране (lg). Уже — нижняя панель
// BottomNav: до неё на телефоне не нужно тянуться в верхний угол (pr-077)
export function Sidebar({ items }: SidebarProps) {
  const { t } = useTranslation()
  const current = items.findIndex((item) => item.current)
  const from = previousCurrent < 0 ? current : previousCurrent

  useEffect(() => {
    previousCurrent = current
  }, [current])

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
      <nav aria-label={t('common.mainNavigation')} className="p-3">
        <ul className="relative flex flex-col gap-1">
          {current >= 0 && (
            <li
              aria-hidden="true"
              data-testid="sidebar-pill"
              className="sidebar-pill pointer-events-none absolute inset-x-0 top-0 h-11 rounded-lg bg-linear-to-r from-accent-soft to-transparent ring-1 ring-accent/20"
              style={
                {
                  '--pill-from': `${from * ITEM_REM}rem`,
                  transform: `translateY(${current * ITEM_REM}rem)`,
                } as CSSProperties
              }
            >
              <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-accent" />
            </li>
          )}
          {items.map((item) => (
            <li key={item.href} className="relative">
              <Link
                to={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={cn(
                  'nav-tab flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition motion-safe:hover:translate-x-1',
                  item.current
                    ? 'font-semibold text-accent'
                    : 'text-ink-soft hover:bg-muted hover:text-ink',
                )}
              >
                <NavIcon href={item.href} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
