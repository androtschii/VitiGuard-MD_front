import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'

export type NavItem = {
  label: string
  href: string
  current?: boolean
}

type SidebarProps = {
  items: NavItem[]
}

// Боковая колонка разделов на широком экране (lg). Уже — нижняя панель
// BottomNav: до неё на телефоне не нужно тянуться в верхний угол (pr-077)
export function Sidebar({ items }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
      <nav aria-label={t('common.mainNavigation')} className="p-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium',
                  item.current
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-soft hover:bg-muted',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
