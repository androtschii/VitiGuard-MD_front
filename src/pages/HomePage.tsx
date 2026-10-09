import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/atoms/Logo'
import { ApiStatus } from '@/components/organisms/ApiStatus'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <CenteredTemplate>
      <Logo className="size-16" />
      <h1 className="text-4xl font-semibold text-accent">VitiGuard MD</h1>
      <p className="max-w-md text-ink-muted">{t('home.description')}</p>
      <ApiStatus />
      <div className="flex gap-3">
        <Link
          to="/map"
          className="inline-flex h-8 items-center rounded-md bg-emerald-700 px-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          {t('home.openMap')}
        </Link>
        <LogoutButton />
      </div>
    </CenteredTemplate>
  )
}
