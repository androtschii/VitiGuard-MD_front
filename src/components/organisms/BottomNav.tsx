import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { NavIcon } from '@/components/atoms/NavIcon'
import type { NavItem } from '@/components/organisms/Sidebar'
import { cn } from '@/lib/cn'

type BottomNavProps = {
  items: NavItem[]
}

const MAX_TILT_DEG = 4

// Наклон панели в сторону текущего раздела: у крайних разделов он наибольший
function tiltFor(items: NavItem[]) {
  const middle = (items.length - 1) / 2
  const current = items.findIndex((item) => item.current)
  if (current < 0 || middle === 0) return '0deg'
  return `${(((current - middle) / middle) * MAX_TILT_DEG).toFixed(2)}deg`
}

// Нижняя панель разделов на телефоне и планшете (pr-077): до неё достаёт
// большой палец. На широком экране её заменяет боковая колонка. Каждая
// страница рисует панель заново, поэтому при переходе анимация значка и
// наклон панели запускаются сами
export function BottomNav({ items }: BottomNavProps) {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('common.mainNavigation')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] perspective-midrange lg:hidden"
    >
      <ul
        className="nav-tabs flex"
        style={{ '--nav-tilt': tiltFor(items) } as CSSProperties}
      >
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              to={item.href}
              viewTransition
              aria-current={item.current ? 'page' : undefined}
              className={cn(
                'nav-tab flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                item.current ? 'text-accent' : 'text-ink-muted',
              )}
            >
              <NavIcon href={item.href} />
              <span className="nav-tab-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
