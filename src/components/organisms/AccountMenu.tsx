import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useLogout } from '@/api/auth'
import { useMe } from '@/api/users'
import { Spinner } from '@/components/atoms/Spinner'
import {
  forgetAccount,
  listAccounts,
  rememberAccount,
  type KnownAccount,
} from '@/lib/accounts'
import { cn } from '@/lib/cn'

function initials(name: string | null, email: string) {
  const source = name?.trim() || email
  const [first = '', second = ''] = source.split(/\s+/)
  const letters = second
    ? first.charAt(0) + second.charAt(0)
    : source.slice(0, 2)
  return letters.toUpperCase()
}

const itemClass =
  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-muted focus-visible:bg-muted'

// Меню профиля в шапке: кто вошёл, переход в профиль, переключение на другой
// аккаунт этого устройства и выход
export function AccountMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const me = useMe()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  // Список читается из хранилища при каждой отрисовке; счётчик заставляет
  // перерисовать меню, когда аккаунт убрали из списка
  const [, setVersion] = useState(0)
  const accounts: KnownAccount[] = listAccounts()
  const menuId = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  // Вошедший аккаунт запоминается для переключателя
  useEffect(() => {
    if (!me.data) return
    rememberAccount({
      email: me.data.email,
      name: me.data.full_name,
      role: me.data.role,
    })
  }, [me.data])

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

  // Выход и вход другим аккаунтом: email подставляется на странице входа
  const switchTo = (email?: string) => {
    setOpen(false)
    logout.mutate(undefined, {
      onSettled: () =>
        void navigate('/login', { state: email ? { email } : null }),
    })
  }

  const current = me.data
  const others = accounts.filter((item) => item.email !== current?.email)

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('account.menu')}
        onClick={() => setOpen((value) => !value)}
        className="fill-hover inline-flex h-8 items-center gap-2 rounded-lg border border-line-strong pr-2 pl-1 text-sm text-ink transition"
      >
        {logout.isPending ? (
          <Spinner className="mx-1 text-accent" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-md bg-accent text-[11px] font-semibold text-white"
          >
            {current ? initials(current.full_name, current.email) : ''}
          </span>
        )}
        <span className="hidden max-w-32 truncate font-medium sm:inline">
          {current?.full_name || current?.email || t('account.menu')}
        </span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t('account.menu')}
          className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-line bg-surface p-1 shadow-lg motion-safe:animate-rise"
        >
          {current && (
            <div className="border-b border-line px-3 pt-2 pb-3">
              <p className="truncate font-medium text-ink">
                {current.full_name || current.email}
              </p>
              <p className="truncate text-xs text-ink-muted">{current.email}</p>
              <p className="mt-1 inline-block rounded bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent">
                {t(`auth.roles.${current.role}`)}
              </p>
            </div>
          )}
          <Link
            role="menuitem"
            to="/profile"
            className={cn(itemClass, 'mt-1')}
            onClick={() => setOpen(false)}
          >
            {t('account.profile')}
          </Link>
          {others.length > 0 && (
            <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-ink-subtle uppercase">
              {t('account.switch')}
            </p>
          )}
          {others.map((account) => (
            <div key={account.email} className="flex items-center">
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => switchTo(account.email)}
              >
                <span
                  aria-hidden="true"
                  className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold text-ink-soft"
                >
                  {initials(account.name, account.email)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate">
                    {account.name || account.email}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {t(`auth.roles.${account.role}`)} · {account.email}
                  </span>
                </span>
              </button>
              <button
                type="button"
                title={t('account.forget')}
                className="rounded-md p-2 text-ink-subtle hover:bg-muted hover:text-ink"
                onClick={() => {
                  forgetAccount(account.email)
                  setVersion((value) => value + 1)
                }}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">
                  {t('account.forgetNamed', { email: account.email })}
                </span>
              </button>
            </div>
          ))}
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => switchTo()}
          >
            {t('account.add')}
          </button>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            className={cn(itemClass, 'text-danger')}
            onClick={() => {
              setOpen(false)
              logout.mutate()
            }}
          >
            {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
