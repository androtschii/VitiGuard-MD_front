import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { NavItem } from '@/components/organisms/Sidebar'
import { cn } from '@/lib/cn'

// Значки разделов (24×24, контур): дом, карта, районы, лист, часы, человек
const ICONS: Record<string, string> = {
  '/': 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  '/map': 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  '/regions': 'M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7',
  '/diagnosis': 'M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l8-8',
  '/history': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  '/profile': 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1-4 4-6 8-6s7 2 8 6',
}

type BottomNavProps = {
  items: NavItem[]
}

// Нижняя панель разделов на телефоне и планшете (pr-077): до неё достаёт
// большой палец. На широком экране её заменяет боковая колонка
export function BottomNav({ items }: BottomNavProps) {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('common.mainNavigation')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              to={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={cn(
                'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                item.current ? 'text-accent' : 'text-ink-muted',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-6"
              >
                <path d={ICONS[item.href] ?? ICONS['/']} />
              </svg>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
