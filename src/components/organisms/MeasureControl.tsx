import type { Position } from 'geojson'
import type {
  GeoJSONSource,
  LayerSpecification,
  MapMouseEvent,
} from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import {
  lineLengthMeters,
  polygonAreaSquareMeters,
  squareMetersToHectares,
} from '@/lib/geo'
import { useMap } from '@/lib/mapContext'
import { measureFeatures } from '@/lib/measure'
import { useMapStore } from '@/store/map'

const SOURCE = 'measure'

// Янтарный — чтобы линейку не путали ни с участками, ни с границами районов
const COLOR = '#d97706'

const layers: LayerSpecification[] = [
  {
    id: 'measure-fill',
    type: 'fill',
    source: SOURCE,
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: { 'fill-color': COLOR, 'fill-opacity': 0.15 },
  },
  {
    id: 'measure-line',
    type: 'line',
    source: SOURCE,
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: { 'line-color': COLOR, 'line-width': 2, 'line-dasharray': [2, 1] },
  },
  {
    id: 'measure-points',
    type: 'circle',
    source: SOURCE,
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-color': COLOR,
      'circle-stroke-width': 2,
    },
  },
]

export function MeasureControl() {
  const { t, i18n } = useTranslation()
  const map = useMap()
  const isDrawing = useMapStore((state) => state.isDrawing)
  const setDrawing = useMapStore((state) => state.setDrawing)
  const [isActive, setIsActive] = useState(false)
  const [points, setPoints] = useState<Position[]>([])

  useEffect(() => {
    if (!map || !isActive) return
    map.addSource(SOURCE, { type: 'geojson', data: measureFeatures([]) })
    for (const layer of layers) map.addLayer(layer)
    // Двойной клик ставит две точки, а не приближает карту
    map.doubleClickZoom.disable()
    map.getCanvas().style.cursor = 'crosshair'

    const onClick = (event: MapMouseEvent) => {
      setPoints((current) => [...current, [event.lngLat.lng, event.lngLat.lat]])
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    map.on('click', onClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      map.off('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
      map.getCanvas().style.cursor = ''
      map.doubleClickZoom.enable()
      try {
        for (const layer of [...layers].reverse()) map.removeLayer(layer.id)
        map.removeSource(SOURCE)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
    // finish меняет только состояние и не зависит от рендера
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isActive])

  useEffect(() => {
    if (!map || !isActive) return
    void map.getSource<GeoJSONSource>(SOURCE)?.setData(measureFeatures(points))
  }, [map, isActive, points])

  if (!map) return null

  const start = () => {
    setPoints([])
    setIsActive(true)
    setDrawing(true)
  }

  function finish() {
    setIsActive(false)
    setPoints([])
    setDrawing(false)
  }

  if (!isActive) {
    return (
      <Button
        size="sm"
        variant="secondary"
        // Пока рисуется контур участка, клики заняты им
        disabled={isDrawing}
        onClick={start}
      >
        {t('measure.start')}
      </Button>
    )
  }

  const number = (value: number, digits: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage, {
      maximumFractionDigits: digits,
    }).format(value)
  const meters = lineLengthMeters(points)
  const distance =
    meters < 1000
      ? t('measure.meters', { value: number(meters, 0) })
      : t('measure.kilometers', { value: number(meters / 1000, 2) })
  const squareMeters =
    points.length >= 3
      ? polygonAreaSquareMeters({
          type: 'Polygon',
          coordinates: [[...points, points[0] ?? []]],
        })
      : null

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 text-sm shadow-sm">
      <p className="text-ink-soft">{t('measure.hint')}</p>
      <div aria-live="polite" className="text-ink">
        <p>{t('measure.distance', { distance })}</p>
        {squareMeters !== null && (
          <p>
            {t('measure.area', {
              hectares: number(squareMetersToHectares(squareMeters), 2),
              squareMeters: number(squareMeters, 0),
            })}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={points.length === 0}
          onClick={() => setPoints((current) => current.slice(0, -1))}
        >
          {t('measure.undo')}
        </Button>
        <Button size="sm" onClick={finish}>
          {t('measure.finish')}
        </Button>
      </div>
    </div>
  )
}
