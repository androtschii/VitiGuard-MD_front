import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useNavItems } from '@/app/navigation'
import { PrintButton } from '@/components/molecules/PrintButton'
import { AlertsSummary } from '@/components/organisms/AlertsSummary'
import { FarmOverview } from '@/components/organisms/FarmOverview'
import { FarmMiniMap } from '@/components/organisms/FarmMiniMap'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { NdviSeason } from '@/components/organisms/NdviSeason'
import { WeatherToday } from '@/components/organisms/WeatherToday'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

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

  useDocumentTitle()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex flex-col gap-6">
        <div className="relative isolate flex flex-col gap-3 overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 via-brand-800 to-brand-950 p-4 shadow-lg sm:gap-4 sm:p-6 print:rounded-none print:bg-none print:p-0 print:shadow-none">
          <svg
            viewBox="0 0 200 190"
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 -right-6 -z-10 h-36 opacity-25 sm:right-6 sm:h-56 print:hidden"
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
            <h1 className="text-xl font-semibold text-white sm:text-2xl print:text-ink">
              {t('home.title')}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-brand-100 print:text-ink-muted">
              {t('home.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Link to="/diagnosis" className={primary}>
              {t('home.openDiagnosis')}
            </Link>
            <Link to="/map" className={secondary}>
              {t('home.openMap')}
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
          </div>
        </div>
        <AlertsSummary />
        <WeatherToday />
        <FarmOverview />
        {/* Схема и график — для экрана: печатная версия главной — только сводка */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] print:hidden">
          <FarmMiniMap />
          <NdviSeason />
        </div>
        <div className="flex justify-end pt-2 print:hidden">
          <PrintButton />
        </div>
      </div>
    </DashboardTemplate>
  )
}
