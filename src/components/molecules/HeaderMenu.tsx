import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'

// На узком экране язык и тема не помещаются в шапку: они прячутся за кнопкой
// меню и раскрываются панелью под шапкой
export function HeaderMenu() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="sm:hidden">
      <button
        ref={button}
        type="button"
        aria-label={t('common.menu')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="fill-hover inline-flex size-8 items-center justify-center rounded-lg border border-line-strong text-ink-soft transition"
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
          <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-30 flex flex-col gap-4 border-b border-line bg-surface px-4 py-4 shadow-lg motion-safe:animate-rise"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-muted">
              {t('common.language')}
            </span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-muted">{t('theme.label')}</span>
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </div>
  )
}
