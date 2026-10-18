import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useTodayRisks } from '@/api/risks'
import { useVineyards } from '@/api/vineyards'
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

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={t('home.stats.vineyards')} value={summary.count} />
        <StatTile
          label={t('home.stats.area')}
          value={t('regions.ha', { value: format(summary.areaHa, 1) })}
        />
        <StatTile
          label={t('home.stats.high')}
          value={hasRisks ? summary.high : '—'}
          hint={t('home.stats.today')}
        />
        <StatTile
          label={t('home.stats.medium')}
          value={hasRisks ? summary.medium : '—'}
          hint={t('home.stats.today')}
        />
      </dl>

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
                  {summary.rows.map(({ vineyard, risk }) => (
                    <tr key={vineyard.id} className="border-t border-line">
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
