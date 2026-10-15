import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Wordmark } from '@/components/atoms/Wordmark'
import { ApiStatus } from '@/components/organisms/ApiStatus'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <CenteredTemplate>
      <h1 aria-label="VitiGuard MD">
        <Wordmark size="lg" withTagline />
      </h1>
      <p className="max-w-md text-ink-muted motion-safe:animate-rise">
        {t('home.description')}
      </p>
      <ApiStatus />
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/map"
          className="inline-flex h-8 items-center rounded-md bg-brand-700 px-3 text-sm font-medium text-white transition hover:bg-brand-800 hover:shadow-md active:translate-y-px"
        >
          {t('home.openMap')}
        </Link>
        <Link
          to="/diagnosis"
          className="inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink transition hover:bg-muted hover:shadow-md active:translate-y-px"
        >
          {t('home.openDiagnosis')}
        </Link>
        <Link
          to="/regions"
          className="inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink transition hover:bg-muted hover:shadow-md active:translate-y-px"
        >
          {t('home.openRegions')}
        </Link>
        <LogoutButton />
      </div>
    </CenteredTemplate>
  )
}
