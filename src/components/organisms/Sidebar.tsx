import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/ui'

export type NavItem = {
  label: string
  href: string
  current?: boolean
}

type SidebarProps = {
  items: NavItem[]
}

// На телефоне боковая панель — выдвижное меню поверх страницы, на широком
// экране (lg) — постоянная колонка. Закрытая панель на телефоне скрыта
// целиком, поэтому её ссылки не попадают в порядок табуляции
export function Sidebar({ items }: SidebarProps) {
  const { t } = useTranslation()
  const isOpen = useUiStore((state) => state.isSidebarOpen)
  const closeSidebar = useUiStore((state) => state.closeSidebar)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeSidebar])

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label={t('common.closeMenu')}
          tabIndex={-1}
          onClick={closeSidebar}
          className="fixed inset-0 z-10 bg-stone-900/50 lg:hidden"
        />
      )}
      <aside
        id="sidebar"
        className={cn(
          'z-20 w-64 shrink-0 border-r border-stone-200 bg-white lg:static lg:flex lg:flex-col',
          isOpen ? 'fixed inset-y-0 left-0 flex flex-col' : 'hidden',
        )}
      >
        <nav aria-label={t('common.mainNavigation')} className="p-3">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={closeSidebar}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium',
                    item.current
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-stone-700 hover:bg-stone-100',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
