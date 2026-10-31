import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useVineyards } from '@/api/vineyards'
import { Input } from '@/components/atoms/Input'
import { Modal } from '@/components/organisms/Modal'
import type { NavItem } from '@/components/organisms/Sidebar'
import { cn } from '@/lib/cn'
import { boundsOf } from '@/lib/geo'
import { useMapStore } from '@/store/map'

type Command = {
  id: string
  label: string
  group: string
  run: () => void
}

function Results({ items, onDone }: { items: NavItem[]; onDone: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const listId = useId()
  const { data: vineyards = [] } = useVineyards()
  const select = useMapStore((state) => state.select)
  const showWineries = useMapStore((state) => state.setShowWineries)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const go = (href: string) => {
    onDone()
    void navigate(href)
  }

  const commands: Command[] = [
    ...items.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      group: t('palette.sections'),
      run: () => go(item.href),
    })),
    ...vineyards.map((vineyard) => ({
      id: `plot-${vineyard.id}`,
      label: vineyard.name,
      group: t('palette.plots'),
      run: () => {
        const bounds = boundsOf([vineyard.geometry])
        if (bounds) {
          const [[west, south], [east, north]] = bounds
          select({
            id: vineyard.id,
            lngLat: [(west + east) / 2, (south + north) / 2],
          })
        }
        go('/map')
      },
    })),
    {
      id: 'wineries',
      label: t('palette.wineries'),
      group: t('palette.actions'),
      run: () => {
        showWineries(true)
        go('/map')
      },
    },
    {
      id: 'compare',
      label: t('home.openCompare'),
      group: t('palette.actions'),
      run: () => go('/compare'),
    },
    {
      id: 'tips',
      label: t('home.openTips'),
      group: t('palette.actions'),
      run: () => go('/tips'),
    },
  ]

  const needle = query.trim().toLowerCase()
  const found = commands.filter((command) =>
    command.label.toLowerCase().includes(needle),
  )
  const current = Math.min(active, Math.max(found.length - 1, 0))

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(Math.min(current + 1, found.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      found[current]?.run()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        // Атрибут, а не autoFocus: иначе showModal отдал бы фокус первой
        // кнопке окна, а React этот атрибут в разметку не пишет
        ref={(input) => input?.setAttribute('autofocus', '')}
        role="combobox"
        aria-label={t('palette.title')}
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={
          found[current] ? `${listId}-${found[current].id}` : undefined
        }
        placeholder={t('palette.placeholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
        onKeyDown={onKeyDown}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={t('palette.title')}
        className="flex max-h-80 flex-col gap-0.5 overflow-y-auto"
      >
        {found.map((command, index) => (
          // С клавиатуры выбор идёт через поле поиска: стрелки и Enter
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={command.id}
            id={`${listId}-${command.id}`}
            role="option"
            aria-selected={index === current}
            onClick={command.run}
            onMouseEnter={() => setActive(index)}
            className={cn(
              'flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              index === current ? 'bg-brand-700 text-white' : 'text-ink',
            )}
          >
            {command.label}
            <span
              className={cn(
                'text-xs',
                index === current ? 'text-brand-100' : 'text-ink-muted',
              )}
            >
              {command.group}
            </span>
          </li>
        ))}
      </ul>
      {found.length === 0 && (
        <p className="text-sm text-ink-muted">{t('palette.empty')}</p>
      )}
    </div>
  )
}

// Быстрый поиск по Ctrl+K: разделы, участки и частые действия в одном окне
export function CommandPalette({ items }: { items: NavItem[] }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label={t('palette.open')}
        aria-keyshortcuts="Control+K"
        title={t('palette.open')}
        onClick={() => setIsOpen(true)}
        className="fill-hover hidden h-8 items-center gap-2 rounded-lg border border-line-strong px-2 text-xs text-ink-soft transition sm:inline-flex"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />
        </svg>
        <kbd className="font-sans">Ctrl K</kbd>
      </button>
      {isOpen && (
        <Modal open onClose={() => setIsOpen(false)} title={t('palette.title')}>
          <Results items={items} onDone={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  )
}
