import { useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CHART,
  linePath,
  monthTicks,
  nearestIndex,
  type TimePoint,
  type TimeScales,
} from '@/lib/timeSeriesChart'

export type ChartSeries<T> = {
  key: string
  // Подпись у конца линии и в подсказке
  label: string
  // Подпись в легенде; для одной серии легенда не нужна — её называет заголовок
  legend?: string
  color: string
  value: (point: T) => number
}

type TimeSeriesChartProps<T extends TimePoint> = {
  points: T[]
  series: ChartSeries<T>[]
  scales: TimeScales
  // Текстовое описание графика для экранного диктора
  label: string
  formatValue: (value: number) => string
  // Сегодня: вертикальная линия, правее — затенённый прогноз
  today?: number
  todayLabel?: string
  // События на оси времени (например, дни заражения)
  markers?: { time: number; label: string }[]
}

// Линейный график по датам: одна ось, деления — начала месяцев, подсказка
// ближайшей точки при наведении. Те же значения должны быть доступны в таблице
// рядом — график сам по себе не читается с клавиатуры
export function TimeSeriesChart<T extends TimePoint>({
  points,
  series,
  scales,
  label,
  formatValue,
  today,
  todayLabel,
  markers = [],
}: TimeSeriesChartProps<T>) {
  const { i18n } = useTranslation()
  const [active, setActive] = useState<number | null>(null)
  const { x, y, invert, first, last, yTicks, height } = scales
  const language = i18n.resolvedLanguage
  const month = new Intl.DateTimeFormat(language, {
    month: 'short',
    timeZone: 'UTC',
  })
  const day = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const point = active === null ? null : points[active]
  const lastPoint = points[points.length - 1]
  const bottom = height - CHART.bottom
  const right = CHART.width - CHART.right
  const legend = series.filter((item) => item.legend)

  const onMove = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!box?.width) return
    const svgX = ((event.clientX - box.left) / box.width) * CHART.width
    setActive(nearestIndex(points, invert(svgX)))
  }

  return (
    <figure className="flex flex-col gap-2">
      {legend.length > 0 && (
        <figcaption className="flex flex-wrap gap-4 text-sm text-ink-soft">
          {legend.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5">
              <svg aria-hidden="true" width="16" height="8">
                <line
                  x1="0"
                  y1="4"
                  x2="16"
                  y2="4"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {item.legend}
            </span>
          ))}
        </figcaption>
      )}
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART.width} ${height}`}
          role="img"
          aria-label={label}
          className="block w-full text-ink-subtle"
        >
          {today !== undefined && today < last && (
            <rect
              data-testid="chart-forecast"
              x={x(Math.max(today, first))}
              y={CHART.top}
              width={right - x(Math.max(today, first))}
              height={bottom - CHART.top}
              fill="var(--muted)"
            />
          )}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={CHART.left}
                x2={right}
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
                {formatValue(tick)}
              </text>
            </g>
          ))}
          {monthTicks(first, last).map((tick) => (
            <text
              key={tick}
              x={x(tick)}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
            >
              {month.format(tick)}
            </text>
          ))}
          {today !== undefined && today >= first && today <= last && (
            <g>
              <line
                x1={x(today)}
                x2={x(today)}
                y1={CHART.top}
                y2={bottom}
                stroke="var(--ink-subtle)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {todayLabel && (
                <text
                  x={x(today) + 4}
                  y={CHART.top + 10}
                  fontSize="11"
                  fill="currentColor"
                >
                  {todayLabel}
                </text>
              )}
            </g>
          )}
          {markers.map((marker) => (
            <path
              key={marker.time}
              d={`M${x(marker.time)},${bottom} l-4,6 h8 z`}
              fill="var(--ink-soft)"
            >
              <title>{marker.label}</title>
            </path>
          ))}
          {point && (
            <line
              x1={x(point.time)}
              x2={x(point.time)}
              y1={CHART.top}
              y2={bottom}
              stroke="var(--line-strong)"
              strokeWidth="1"
            />
          )}
          {series.map((item) => (
            <g key={item.key}>
              <path
                d={linePath(points, item.value, x, y)}
                fill="none"
                stroke={item.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Подпись у конца линии: серию видно и без легенды и цвета.
                  Одну линию называет заголовок графика — подпись не нужна */}
              {series.length > 1 && (
                <text
                  x={x(lastPoint.time) + 8}
                  y={y(item.value(lastPoint))}
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--ink-soft)"
                >
                  {item.label}
                </text>
              )}
              {point && (
                <circle
                  cx={x(point.time)}
                  cy={y(item.value(point))}
                  r="4"
                  fill={item.color}
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
            width={right - CHART.left}
            height={bottom - CHART.top}
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
            {series.map((item) => (
              <p key={item.key}>
                {item.label} {formatValue(item.value(point))}
              </p>
            ))}
          </div>
        )}
      </div>
    </figure>
  )
}
