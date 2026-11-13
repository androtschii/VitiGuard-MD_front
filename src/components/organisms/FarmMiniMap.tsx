import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useBoundaries } from '@/api/geo'
import { useVineyards } from '@/api/vineyards'
import { boundsOf, projection, svgPath } from '@/lib/miniMap'
import { vineyardPoint } from '@/lib/vineyardPoint'

const WIDTH = 320

// Схема Молдовы с участками хозяйства: где они лежат относительно друг друга.
// Это не карта — по нажатию открывается настоящая
export function FarmMiniMap() {
  const { t } = useTranslation()
  const boundaries = useBoundaries()
  const vineyards = useVineyards()
  const plots = vineyards.data ?? []

  if (plots.length === 0 || !boundaries.data?.country) return null
  const view = projection(boundsOf([boundaries.data.country]), WIDTH)

  return (
    <section
      aria-labelledby="farm-mini-map"
      className="stagger flex flex-col rounded-lg border border-line bg-surface p-4 shadow-sm [--i:3] motion-safe:animate-rise"
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 id="farm-mini-map" className="text-sm font-medium text-ink">
          {t('miniMap.title')}
        </h2>
        <Link to="/map" className="text-sm font-medium text-accent underline">
          {t('miniMap.open')}
        </Link>
      </div>
      <svg
        role="img"
        aria-label={t('miniMap.label', { count: plots.length })}
        viewBox={`-8 -8 ${view.width + 16} ${view.height + 16}`}
        className="mx-auto h-64 w-full max-w-xs lg:h-72"
      >
        <path
          d={svgPath(boundaries.data.country, view)}
          className="fill-muted stroke-line-strong"
          strokeWidth={1.2}
        />
        {boundaries.data.districts.map((district, index) => (
          <path
            key={index}
            d={svgPath(district, view)}
            className="fill-none stroke-line"
            strokeWidth={0.5}
          />
        ))}
        {plots.map((plot, index) => {
          const point = vineyardPoint(plot)
          if (!point) return null
          const [x, y] = view.project(point)
          return (
            <g key={plot.id} data-testid="mini-map-plot">
              <title>{plot.name}</title>
              <circle
                cx={x}
                cy={y}
                r={9}
                className="mini-map-pulse fill-accent/25"
                style={{ animationDelay: `${index * 0.4}s` }}
              />
              <circle
                cx={x}
                cy={y}
                r={4.5}
                className="fill-accent stroke-surface"
                strokeWidth={1.5}
              />
            </g>
          )
        })}
      </svg>
      <ul className="mt-2 flex flex-col gap-1 text-xs text-ink-soft">
        {plots.map((plot) => (
          <li key={plot.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-accent"
            />
            {plot.name}
          </li>
        ))}
      </ul>
    </section>
  )
}
