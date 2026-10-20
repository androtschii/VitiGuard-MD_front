import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useNavItems } from '@/app/navigation'
import { PrintButton } from '@/components/molecules/PrintButton'
import { ApiStatus } from '@/components/organisms/ApiStatus'
import { FarmOverview } from '@/components/organisms/FarmOverview'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

const primary =
  'inline-flex h-8 items-center rounded-md bg-brand-700 px-3 text-sm font-medium text-white transition hover:bg-brand-800 hover:shadow-md active:translate-y-px'
const secondary =
  'inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink transition hover:bg-muted hover:shadow-md active:translate-y-px'

// Главная — сводка хозяйства (pr-053) и переходы к разделам
export function HomePage() {
  const { t } = useTranslation()
  const navItems = useNavItems()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">
              {t('home.title')}
            </h1>
            <p className="max-w-xl text-sm text-ink-muted">
              {t('home.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Link to="/map" className={primary}>
              {t('home.openMap')}
            </Link>
            <Link to="/diagnosis" className={secondary}>
              {t('home.openDiagnosis')}
            </Link>
            <Link to="/regions" className={secondary}>
              {t('home.openRegions')}
            </Link>
            <Link to="/compare" className={secondary}>
              {t('home.openCompare')}
            </Link>
            <PrintButton />
          </div>
        </div>
        <FarmOverview />
        <div className="print:hidden">
          <ApiStatus />
        </div>
      </div>
    </DashboardTemplate>
  )
}
