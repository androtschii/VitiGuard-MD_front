import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useNavItems } from '@/app/navigation'
import { PrintButton } from '@/components/molecules/PrintButton'
import { AlertsSummary } from '@/components/organisms/AlertsSummary'
import { ApiStatus } from '@/components/organisms/ApiStatus'
import { FarmOverview } from '@/components/organisms/FarmOverview'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

const primary =
  'fill-hover inline-flex h-9 items-center rounded-md bg-white px-3 text-sm font-semibold text-brand-900 transition [--fill-ink:var(--color-white)] [--fill:var(--color-brand-500)] active:translate-y-px'
const secondary =
  'fill-hover inline-flex h-9 items-center rounded-md border border-white/40 px-3 text-sm font-medium text-white transition [--fill-ink:var(--color-brand-900)] [--fill:var(--color-white)] active:translate-y-px'

const BERRIES = [
  [60, 20],
  [100, 20],
  [140, 20],
  [40, 56],
  [80, 56],
  [120, 56],
  [160, 56],
  [60, 92],
  [100, 92],
  [140, 92],
  [80, 128],
  [120, 128],
  [100, 164],
]

// Главная — сводка хозяйства (pr-053) и переходы к разделам
export function HomePage() {
  const { t } = useTranslation()
  const navItems = useNavItems()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-5xl flex-col gap-6">
        <div className="relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 via-brand-800 to-brand-950 p-6 shadow-lg print:rounded-none print:bg-none print:p-0 print:shadow-none">
          <svg
            viewBox="0 0 200 190"
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 -right-6 -z-10 h-56 opacity-25 sm:right-6 print:hidden"
          >
            {BERRIES.map(([cx, cy], index) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="18"
                fill="var(--color-brand-300)"
                className="hero-berry"
                style={{ '--i': index } as React.CSSProperties}
              />
            ))}
          </svg>
          <div>
            <h1 className="text-2xl font-semibold text-white print:text-ink">
              {t('home.title')}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-brand-100 print:text-ink-muted">
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
            <Link to="/tips" className={secondary}>
              {t('home.openTips')}
            </Link>
            <PrintButton className="h-9 border-white/40 bg-transparent text-white [--fill-ink:var(--color-brand-900)] [--fill:var(--color-white)]" />
          </div>
        </div>
        <AlertsSummary />
        <FarmOverview />
        <div className="print:hidden">
          <ApiStatus />
        </div>
      </div>
    </DashboardTemplate>
  )
}
