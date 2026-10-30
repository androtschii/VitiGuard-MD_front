import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useTodayRisks } from '@/api/risks'
import { useVineyards } from '@/api/vineyards'
import { CountUp } from '@/components/atoms/CountUp'
import { Ring } from '@/components/atoms/Ring'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import { StatTile } from '@/components/molecules/StatTile'
import { summarize } from '@/lib/dashboard'

// Сводка хозяйства на главной (pr-053): плитки с итогами и риск каждого
// участка на сегодня
export function FarmOverview() {
  const { t, i18n } = useTranslation()
  const vineyards = useVineyards()
  const risks = useTodayRisks()

  if (vineyards.isPending) return <CardSkeleton />
  if (vineyards.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('home.loadError')}
      </p>
    )
  }

  const summary = summarize(vineyards.data, risks.data)
  const format = (value: number, digits: number) =>
    new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: digits,
    }).format(value)
  const hasRisks = summary.rows.some((row) => row.risk)
  const unknown = summary.count - summary.high - summary.medium - summary.low
  const share = (value: number) => (value / summary.count) * 100
  const levels = [
    {
      key: 'high',
      label: t('risk.levels.high'),
      count: summary.high,
      ring: 'stroke-red-600 dark:stroke-red-400',
      dot: 'bg-red-600 dark:bg-red-400',
    },
    {
      key: 'medium',
      label: t('risk.levels.medium'),
      count: summary.medium,
      ring: 'stroke-amber-500',
      dot: 'bg-amber-500',
    },
    {
      key: 'low',
      label: t('risk.levels.low'),
      count: summary.low,
      ring: 'stroke-emerald-600 dark:stroke-emerald-400',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
    },
    {
      key: 'unknown',
      label: t('home.noEstimate'),
      count: unknown,
      ring: 'stroke-line-strong',
      dot: 'bg-line-strong',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <dl className="grid grid-cols-2 gap-3">
          <StatTile
            index={0}
            label={t('home.stats.vineyards')}
            value={<CountUp value={summary.count} />}
          />
          <StatTile
            index={1}
            label={t('home.stats.area')}
            value={
              <CountUp
                value={summary.areaHa}
                format={(value) => t('regions.ha', { value: format(value, 1) })}
              />
            }
          />
          <StatTile
            index={2}
            label={t('home.stats.high')}
            tone={summary.high > 0 ? 'high' : undefined}
            value={hasRisks ? <CountUp value={summary.high} /> : '—'}
            hint={t('home.stats.today')}
          />
          <StatTile
            index={3}
            label={t('home.stats.medium')}
            tone={summary.medium > 0 ? 'medium' : undefined}
            value={hasRisks ? <CountUp value={summary.medium} /> : '—'}
            hint={t('home.stats.today')}
          />
        </dl>
        {summary.count > 0 && (
          <section
            aria-labelledby="home-ring"
            className="stagger flex items-center gap-5 rounded-lg border border-line bg-surface p-4 shadow-sm [--i:4] motion-safe:animate-rise"
          >
            <Ring
              className="size-28"
              segments={levels.map(({ count, ring }) => ({
                percent: share(count),
                className: ring,
              }))}
            >
              <span className="text-2xl font-semibold text-ink tabular-nums">
                <CountUp value={summary.count} />
              </span>
            </Ring>
            <div>
              <h2
                id="home-ring"
                className="mb-2 text-sm font-semibold text-ink"
              >
                {t('home.ringTitle')}
              </h2>
              <ul className="flex flex-col gap-1 text-sm text-ink-soft">
                {levels.map(({ key, label, count, dot }) => (
                  <li key={key} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full ${dot}`}
                    />
                    {`${label}: ${count}`}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <section aria-labelledby="home-plots" className="flex flex-col gap-2">
        <h2 id="home-plots" className="text-base font-semibold text-ink">
          {t('home.plots')}
        </h2>
        {summary.count === 0 ? (
          <p className="text-sm text-ink-muted">
            {t('home.noVineyards')}{' '}
            <Link to="/map" className="text-accent underline">
              {t('home.openMap')}
            </Link>
          </p>
        ) : (
          <>
            {!hasRisks && (
              <p className="text-sm text-ink-muted">{t('risk.offSeason')}</p>
            )}
            <div className="overflow-x-auto rounded-lg border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-ink-soft">
                  <tr>
                    <th className="px-3 py-2 font-medium">
                      {t('home.columns.name')}
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      {t('home.columns.area')}
                    </th>
                    <th className="px-3 py-2 font-medium">{t('risk.downy')}</th>
                    <th className="px-3 py-2 font-medium">
                      {t('risk.powdery')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map(({ vineyard, risk }, index) => (
                    <tr
                      key={vineyard.id}
                      style={
                        { '--i': Math.min(index, 8) } as React.CSSProperties
                      }
                      className="stagger border-t border-line transition-colors hover:bg-accent-soft motion-safe:animate-rise"
                    >
                      <td className="px-3 py-2 text-ink">{vineyard.name}</td>
                      <td className="px-3 py-2 text-right text-ink-soft tabular-nums">
                        {format(vineyard.area_ha, 2)}
                      </td>
                      {risk ? (
                        <>
                          <td className="px-3 py-2">
                            <RiskBadge level={risk.downy} />
                          </td>
                          <td className="px-3 py-2">
                            <RiskBadge level={risk.powdery} />
                          </td>
                        </>
                      ) : (
                        <td colSpan={2} className="px-3 py-2 text-ink-subtle">
                          {t('home.noEstimate')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
