import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <CenteredTemplate>
      <p className="text-6xl font-semibold text-accent">404</p>
      <h1 className="text-2xl font-semibold text-ink">{t('notFound.title')}</h1>
      <p className="max-w-md text-ink-muted">{t('notFound.text')}</p>
      <Link
        to="/"
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        {t('notFound.home')}
      </Link>
    </CenteredTemplate>
  )
}
