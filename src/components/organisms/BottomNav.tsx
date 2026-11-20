import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { NavIcon } from '@/components/atoms/NavIcon'
import type { NavItem } from '@/components/organisms/Sidebar'
import { cn } from '@/lib/cn'

type BottomNavProps = {
  items: NavItem[]
}

const MAX_VISIBLE = 5
const MAX_TILT_DEG = 4

// Наклон панели в сторону текущего раздела: у крайних разделов он наибольший
function tiltFor(count: number, current: number) {
  const middle = (count - 1) / 2
  if (current < 0 || middle === 0) return '0deg'
  return `${(((current - middle) / middle) * MAX_TILT_DEG).toFixed(2)}deg`
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="nav-icon size-6"
    >
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  )
}

// Нижняя панель разделов на телефоне и планшете (pr-077): до неё
// достаёт большой палец. Если разделов больше 5 — первые 4 + кнопка «Ещё»,
// открывающая остальные во всплывающем меню
export function BottomNav({ items }: BottomNavProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  const hasOverflow = items.length > MAX_VISIBLE
  const visibleItems = hasOverflow ? items.slice(0, 4) : items
  const overflowItems = hasOverflow ? items.slice(4) : []
  const isMoreActive = overflowItems.some((item) => item.current)

  const activeIndex = hasOverflow
    ? visibleItems.findIndex((item) => item.current) >= 0
      ? visibleItems.findIndex((item) => item.current)
      : isMoreActive
        ? 4
        : -1
    : visibleItems.findIndex((item) => item.current)

  const count = hasOverflow ? 5 : visibleItems.length
  const tilt = tiltFor(count, activeIndex)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        moreButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>('a')
      firstLink?.focus()
    }
  }, [open])

  return (
    <nav
      ref={rootRef}
      aria-label={t('common.mainNavigation')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] perspective-midrange lg:hidden"
    >
      {open && overflowItems.length > 0 && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t('nav.more')}
          className="absolute right-2 bottom-full mb-2 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-xl motion-safe:animate-rise"
        >
          <ul className="flex flex-col">
            {overflowItems.map((item) => (
              <li key={item.href} role="none">
                <Link
                  to={item.href}
                  role="menuitem"
                  viewTransition
                  aria-current={item.current ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    item.current
                      ? 'bg-accent/10 text-accent'
                      : 'text-ink hover:bg-muted',
                  )}
                >
                  <NavIcon href={item.href} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul
        className="nav-tabs flex"
        style={{ '--nav-tilt': tilt } as CSSProperties}
      >
        {visibleItems.map((item) => (
          <li key={item.href} className="min-w-0 flex-1">
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
              <span
                className="nav-tab-label max-w-full truncate px-0.5"
                title={item.label}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}

        {hasOverflow && (
          <li className="min-w-0 flex-1">
            <button
              ref={moreButtonRef}
              type="button"
              aria-label={t('nav.more')}
              aria-expanded={open}
              aria-controls={menuId}
              aria-current={isMoreActive ? 'page' : undefined}
              onClick={() => setOpen((prev) => !prev)}
              className={cn(
                'nav-tab flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium',
                isMoreActive ? 'text-accent' : 'text-ink-muted',
              )}
            >
              <MoreIcon />
              <span
                className="nav-tab-label max-w-full truncate px-0.5"
                title={t('nav.more')}
              >
                {t('nav.more')}
              </span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
