import { useTranslation } from 'react-i18next'
import type { VegetationObservation } from '@/api/vegetation'
import { TimeSeriesChart } from '@/components/organisms/TimeSeriesChart'
import { chartPoints, chartRange, type ChartPoint } from '@/lib/vegetationChart'

type VegetationChartProps = {
  observations: VegetationObservation[]
}

// Динамика NDVI и NDRE участка за сезон. Оба индекса в одних единицах (−1..1),
// поэтому у графика одна ось. Цвета линий — токены темы (index.css): палитра
// проверена на различимость при нарушениях цветового зрения отдельно для
// светлой и тёмной темы
export function VegetationChart({ observations }: VegetationChartProps) {
  const { t, i18n } = useTranslation()
  const points = chartPoints(observations)
  if (points.length === 0) return null

  const day = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const value = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <TimeSeriesChart<ChartPoint>
      points={points}
      range={chartRange(points)}
      label={t('vegetation.chartLabel', {
        count: points.length,
        from: day.format(points[0].time),
        to: day.format(points[points.length - 1].time),
      })}
      formatValue={(number) => value.format(number)}
      series={[
        {
          key: 'ndvi',
          label: 'NDVI',
          legend: t('vegetation.series.ndvi'),
          color: 'var(--chart-ndvi)',
          value: (point) => point.ndvi,
        },
        {
          key: 'ndre',
          label: 'NDRE',
          legend: t('vegetation.series.ndre'),
          color: 'var(--chart-ndre)',
          value: (point) => point.ndre,
        },
      ]}
    />
  )
}
