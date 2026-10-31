import type { Point } from 'geojson'
import type { LayerSpecification, MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  WINERIES_URL,
  type Winery,
  type WineryProperties,
} from '@/api/wineries'
import { Button } from '@/components/atoms/Button'
import { useMap } from '@/lib/mapContext'
import { MAX_STOPS } from '@/lib/wineRoute'
import { useMapStore } from '@/store/map'

const SOURCE = 'wineries'
const LAYER = 'wineries-points'

const layer: LayerSpecification = {
  id: LAYER,
  type: 'circle',
  source: SOURCE,
  paint: {
    'circle-radius': 7,
    'circle-color': ['match', ['get', 'kind'], 'winery', '#622ac3', '#c026d3'],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2,
  },
}

// Винодельни и винные магазины Молдовы: клик по точке открывает карточку
export function WineriesLayer() {
  const { t } = useTranslation()
  const map = useMap()
  const isEnabled = useMapStore((state) => state.showWineries)
  const route = useMapStore((state) => state.wineRoute)
  const addStop = useMapStore((state) => state.addRouteStop)
  const [selected, setSelected] = useState<Winery | null>(null)

  useEffect(() => {
    if (!map || !isEnabled) return
    map.addSource(SOURCE, { type: 'geojson', data: WINERIES_URL })
    map.addLayer(layer)

    const onClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      setSelected(
        feature
          ? {
              ...(feature.properties as WineryProperties),
              // Координаты самой точки, а не места клика рядом с ней
              lon: (feature.geometry as Point).coordinates[0],
              lat: (feature.geometry as Point).coordinates[1],
            }
          : null,
      )
    }
    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }
    const onLeave = () => {
      map.getCanvas().style.cursor = ''
    }
    map.on('click', LAYER, onClick)
    map.on('mouseenter', LAYER, onEnter)
    map.on('mouseleave', LAYER, onLeave)

    return () => {
      map.off('click', LAYER, onClick)
      map.off('mouseenter', LAYER, onEnter)
      map.off('mouseleave', LAYER, onLeave)
      setSelected(null)
      try {
        map.removeLayer(LAYER)
        map.removeSource(SOURCE)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
  }, [map, isEnabled])

  if (!selected) return null
  return (
    <section
      aria-label={selected.name}
      className="absolute right-2 bottom-8 z-10 flex w-64 max-w-[calc(100%-1rem)] flex-col gap-1 rounded-lg border border-line bg-surface p-3 text-sm text-ink shadow-lg motion-safe:animate-rise"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold">{selected.name}</h2>
        <Button
          size="sm"
          variant="ghost"
          aria-label={t('common.close')}
          className="-mt-1 -mr-1"
          onClick={() => setSelected(null)}
        >
          ×
        </Button>
      </div>
      <p className="text-ink-muted">
        {t(`wineries.kinds.${selected.kind}`)}
        {selected.city ? ` · ${selected.city}` : ''}
      </p>
      {selected.approximate && (
        <p className="text-xs text-ink-muted">{t('wineries.approximate')}</p>
      )}
      {selected.phone && (
        <a href={`tel:${selected.phone}`} className="text-accent underline">
          {selected.phone}
        </a>
      )}
      {selected.website && (
        <a
          href={selected.website}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          {t('wineries.website')}
        </a>
      )}
      <Button
        size="sm"
        variant="secondary"
        disabled={
          route.length >= MAX_STOPS ||
          route.some((stop) => stop.name === selected.name)
        }
        onClick={() =>
          addStop({
            name: selected.name,
            lat: selected.lat,
            lon: selected.lon,
          })
        }
      >
        {t(
          route.some((stop) => stop.name === selected.name)
            ? 'wineRoute.added'
            : 'wineRoute.add',
        )}
      </Button>
    </section>
  )
}
