import { useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { VegetationObservation } from '@/api/vegetation'
import {
  CHART,
  chartPoints,
  chartScales,
  linePath,
  monthTicks,
  nearestIndex,
} from '@/lib/vegetationChart'

type VegetationChartProps = {
  observations: VegetationObservation[]
}

// Цвета линий — токены темы (index.css): палитра проверена на различимость
// при нарушениях цветового зрения отдельно для светлой и тёмной темы
const SERIES = [
  { key: 'ndvi', label: 'NDVI', color: 'var(--chart-ndvi)' },
  { key: 'ndre', label: 'NDRE', color: 'var(--chart-ndre)' },
] as const

// Динамика NDVI и NDRE участка за сезон. Оба индекса в одних единицах (−1..1),
// поэтому у графика одна ось. Наведение показывает значения ближайшего снимка;
// те же числа — в таблице под графиком
export function VegetationChart({ observations }: VegetationChartProps) {
  const { t, i18n } = useTranslation()
  const [active, setActive] = useState<number | null>(null)
  const points = chartPoints(observations)
  if (points.length === 0) return null

  const { x, y, invert, first, last, yTicks } = chartScales(points)
  const language = i18n.resolvedLanguage
  const month = new Intl.DateTimeFormat(language, {
    month: 'short',
    timeZone: 'UTC',
  })
  const day = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const value = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const point = active === null ? null : points[active]
  const lastPoint = points[points.length - 1]

  const onMove = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!box?.width) return
    const svgX = ((event.clientX - box.left) / box.width) * CHART.width
    setActive(nearestIndex(points, invert(svgX)))
  }

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap gap-4 text-sm text-ink-soft">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-1.5">
            <svg aria-hidden="true" width="16" height="8">
              <line
                x1="0"
                y1="4"
                x2="16"
                y2="4"
                stroke={series.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {t(`vegetation.series.${series.key}`)}
          </span>
        ))}
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          role="img"
          aria-label={t('vegetation.chartLabel', {
            count: points.length,
            from: day.format(first),
            to: day.format(last),
          })}
          className="block w-full text-ink-subtle"
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={CHART.left}
                x2={CHART.width - CHART.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--line)"
                strokeWidth="1"
              />
              <text
                x={CHART.left - 6}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fill="currentColor"
              >
                {value.format(tick)}
              </text>
            </g>
          ))}
          {monthTicks(first, last).map((tick) => (
            <text
              key={tick}
              x={x(tick)}
              y={CHART.height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
            >
              {month.format(tick)}
            </text>
          ))}
          {point && (
            <line
              x1={x(point.time)}
              x2={x(point.time)}
              y1={CHART.top}
              y2={CHART.height - CHART.bottom}
              stroke="var(--line-strong)"
              strokeWidth="1"
            />
          )}
          {SERIES.map((series) => (
            <g key={series.key}>
              <path
                d={linePath(points, series.key, x, y)}
                fill="none"
                stroke={series.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Подпись у конца линии: серию видно и без легенды и цвета */}
              <text
                x={x(lastPoint.time) + 8}
                y={y(lastPoint[series.key])}
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--ink-soft)"
              >
                {series.label}
              </text>
              {point && (
                <circle
                  cx={x(point.time)}
                  cy={y(point[series.key])}
                  r="4"
                  fill={series.color}
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
          {/* Область наведения больше самих линий: попасть мышью проще */}
          <rect
            data-testid="chart-hover"
            x={CHART.left}
            y={CHART.top}
            width={CHART.width - CHART.left - CHART.right}
            height={CHART.height - CHART.top - CHART.bottom}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
        {point && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-ink shadow-md"
            style={{
              left: `${(x(point.time) / CHART.width) * 100}%`,
              transform: `translateX(${x(point.time) > CHART.width / 2 ? '-105%' : '5%'})`,
            }}
          >
            <p className="font-medium">{day.format(point.time)}</p>
            <p>NDVI {value.format(point.ndvi)}</p>
            <p>NDRE {value.format(point.ndre)}</p>
          </div>
        )}
      </div>
    </figure>
  )
}
