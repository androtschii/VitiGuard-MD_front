import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useTodayRisks } from '@/api/risks'
import { useNdviAnomalies, useVegetation } from '@/api/vegetation'
import type { Vineyard } from '@/api/vineyards'
import { PeriodFilter } from '@/components/molecules/PeriodFilter'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import { TimeSeriesChart } from '@/components/organisms/TimeSeriesChart'
import { clearNdvi, pairSeries, type PairPoint } from '@/lib/compare'
import { inPeriod, periodRange, SEASON, type Period } from '@/lib/period'
import { indexRange } from '@/lib/vegetationChart'

type VineyardComparisonProps = {
  a: Vineyard
  b: Vineyard
}

// Два участка рядом: паспорт, риск на сегодня, вегетация и её просадки, а
// ниже — NDVI обоих на одном графике за общий период снимков
export function VineyardComparison({ a, b }: VineyardComparisonProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const history = [useVegetation(a.id).data, useVegetation(b.id).data]
  const anomalies = [useNdviAnomalies(a.id).data, useNdviAnomalies(b.id).data]
  const { data: risks = [] } = useTodayRisks()
  const series = history.map((items) => clearNdvi(items ?? []))
  const [period, setPeriod] = useState<Period>(SEASON)
  const all = pairSeries(series[0], series[1])
  const lastTime = all.at(-1)?.time
  const pair =
    lastTime === undefined
      ? all
      : inPeriod(
          all,
          (point) => point.time,
          periodRange(period, new Date(lastTime).toISOString().slice(0, 10)),
        )

  const hectares = new Intl.NumberFormat(language, { maximumFractionDigits: 2 })
  const index = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const day = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
  const medium = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const dash = '—'

  const risk = (vineyard: Vineyard, disease: 'downy' | 'powdery') => {
    const today = risks.find((item) => item.vineyard_id === vineyard.id)
    return today ? <RiskBadge level={today[disease]} /> : dash
  }
  const latest = (position: number) => {
    const last = series[position].at(-1)
    return last ? `${index.format(last.ndvi)} · ${day.format(last.time)}` : dash
  }
  const drops = (position: number) => {
    const found = anomalies[position]
    if (!found) return dash
    if (found.length === 0) return t('compare.noDrops')
    const confirmed = found.filter((item) => item.level === 'confirmed').length
    return t('compare.drops', { count: found.length, confirmed })
  }

  const rows: { label: string; cells: [ReactNode, ReactNode] }[] = [
    {
      label: t('compare.rows.area'),
      cells: [
        t('regions.ha', { value: hectares.format(a.area_ha) }),
        t('regions.ha', { value: hectares.format(b.area_ha) }),
      ],
    },
    {
      label: t('compare.rows.variety'),
      cells: [a.variety?.name ?? dash, b.variety?.name ?? dash],
    },
    {
      label: t('compare.rows.planted'),
      cells: [a.planting_year ?? dash, b.planting_year ?? dash],
    },
    {
      label: t('compare.rows.downy'),
      cells: [risk(a, 'downy'), risk(b, 'downy')],
    },
    {
      label: t('compare.rows.powdery'),
      cells: [risk(a, 'powdery'), risk(b, 'powdery')],
    },
    { label: t('compare.rows.ndvi'), cells: [latest(0), latest(1)] },
    {
      label: t('compare.rows.clear'),
      cells: [series[0].length, series[1].length],
    },
    { label: t('compare.rows.drops'), cells: [drops(0), drops(1)] },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-sm">
        <table className="w-full text-sm">
          <caption className="sr-only">{t('compare.table')}</caption>
          <thead className="bg-muted/40 text-left text-ink-soft">
            <tr>
              <td className="px-3 py-2" />
              <th scope="col" className="px-3 py-2 font-semibold">
                {a.name}
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                {b.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th
                  scope="row"
                  className="px-3 py-2 text-left font-normal text-ink-muted"
                >
                  {row.label}
                </th>
                <td className="px-3 py-2 text-ink">{row.cells[0]}</td>
                <td className="px-3 py-2 text-ink">{row.cells[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">{t('compare.chart')}</h2>
        {all.length > 1 && <PeriodFilter value={period} onChange={setPeriod} />}
        {pair.length > 1 ? (
          <TimeSeriesChart<PairPoint>
            points={pair}
            range={indexRange(pair.flatMap((point) => [point.a, point.b]))}
            label={t('compare.chartLabel', {
              a: a.name,
              b: b.name,
              from: medium.format(pair[0].time),
              to: medium.format(pair[pair.length - 1].time),
            })}
            formatValue={(value) => index.format(value)}
            series={[
              {
                key: 'a',
                label: 'A',
                legend: `A — ${a.name}`,
                color: 'var(--chart-ndvi)',
                value: (point) => point.a,
              },
              {
                key: 'b',
                label: 'B',
                legend: `B — ${b.name}`,
                color: 'var(--chart-ndre)',
                value: (point) => point.b,
              },
            ]}
          />
        ) : (
          <p className="text-sm text-ink-muted">
            {all.length > 1 ? t('period.empty') : t('compare.noCommon')}
          </p>
        )}
      </section>
    </div>
  )
}
