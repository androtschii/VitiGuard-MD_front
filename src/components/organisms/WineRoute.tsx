import type { GeoJSONSource, LayerSpecification } from 'maplibre-gl'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { useMap } from '@/lib/mapContext'
import { directionsUrl, orderStops, routeLengthKm } from '@/lib/wineRoute'
import { useMapStore } from '@/store/map'

const SOURCE = 'wine-route'
const line: LayerSpecification = {
  id: 'wine-route-line',
  type: 'line',
  source: SOURCE,
  paint: {
    'line-color': '#622ac3',
    'line-width': 3,
    'line-dasharray': [2, 1.5],
  },
}

const lineOf = (coordinates: [number, number][]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates },
})

// Линия маршрута на карте: прямые между точками, дороги строит навигатор
export function WineRouteLine() {
  const map = useMap()
  const route = useMapStore((state) => state.wineRoute)
  const hasRoute = route.length > 1

  useEffect(() => {
    if (!map || !hasRoute) return
    map.addSource(SOURCE, { type: 'geojson', data: lineOf([]) })
    map.addLayer(line)
    return () => {
      try {
        map.removeLayer(line.id)
        map.removeSource(SOURCE)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
  }, [map, hasRoute])

  useEffect(() => {
    if (!map || !hasRoute) return
    const source = map.getSource<GeoJSONSource>(SOURCE)
    void source?.setData(
      lineOf(orderStops(route).map((stop) => [stop.lon, stop.lat])),
    )
  }, [map, hasRoute, route])

  return null
}

// Список остановок винного маршрута и ссылка для навигатора
export function WineRoutePanel() {
  const { t, i18n } = useTranslation()
  const route = useMapStore((state) => state.wineRoute)
  const removeStop = useMapStore((state) => state.removeRouteStop)
  const clear = useMapStore((state) => state.clearRoute)

  if (route.length === 0) return null
  const stops = orderStops(route)
  const km = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 0,
  }).format(routeLengthKm(stops))

  return (
    <section
      aria-label={t('wineRoute.title')}
      className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 text-sm text-ink shadow-sm motion-safe:animate-rise"
    >
      <h2 className="font-semibold">{t('wineRoute.title')}</h2>
      <ol className="flex flex-col gap-1">
        {stops.map((stop, index) => (
          <li key={stop.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-semibold text-white"
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 break-words">{stop.name}</span>
            <button
              type="button"
              aria-label={t('wineRoute.remove', { name: stop.name })}
              onClick={() => removeStop(stop.name)}
              className="rounded px-1 text-ink-muted hover:text-danger"
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      {stops.length > 1 ? (
        <>
          <p className="text-xs text-ink-muted">
            {t('wineRoute.length', { km })}
          </p>
          <a
            href={directionsUrl(stops)}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-accent underline"
          >
            {t('wineRoute.navigate')}
          </a>
        </>
      ) : (
        <p className="text-xs text-ink-muted">{t('wineRoute.addMore')}</p>
      )}
      <Button size="sm" variant="ghost" className="self-start" onClick={clear}>
        {t('wineRoute.clear')}
      </Button>
    </section>
  )
}
