import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useUnreadAlerts } from '@/api/alerts'

// Колокольчик в шапке: сколько предупреждений не прочитано (pr-063)
export function AlertsBell() {
  const { t } = useTranslation()
  const { data: count = 0 } = useUnreadAlerts()

  return (
    <Link
      to="/alerts"
      aria-label={count ? t('alerts.bellUnread', { count }) : t('alerts.bell')}
      className="relative inline-flex size-9 items-center justify-center rounded-md text-ink-soft transition hover:bg-muted"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5"
      >
        <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 0 0 4 0" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-semibold text-white"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
