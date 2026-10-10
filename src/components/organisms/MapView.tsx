import {
  FullscreenControl,
  Map,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BasemapSwitcher } from '@/components/molecules/BasemapSwitcher'
import { basemapVisibility, buildStyle } from '@/lib/basemaps'
import { cn } from '@/lib/cn'
import {
  MAX_ZOOM,
  MIN_ZOOM,
  MOLDOVA_BOUNDS,
  MOLDOVA_MAX_BOUNDS,
  supportsWebGL,
} from '@/lib/map'
import { useMapStore } from '@/store/map'

// MapLibre ищет файл фонового потока рядом со своим кодом, а Vite складывает
// сборку в другое место: адрес собранного потока передаётся явно
setWorkerUrl(workerUrl)

type MapViewProps = {
  className?: string
}

export function MapView({ className }: MapViewProps) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  // Без WebGL MapLibre не создаёт карту: вместо пустого блока — объяснение
  const [isSupported] = useState(supportsWebGL)
  const mapRef = useRef<Map | null>(null)
  const basemap = useMapStore((state) => state.basemap)
  const setBasemap = useMapStore((state) => state.setBasemap)
  // Подложка нужна при создании карты, но её смена не должна карту пересоздавать
  const basemapRef = useRef(basemap)

  // Карта пересоздаётся при смене языка: подписи кнопок MapLibre задаются
  // только при создании. Язык меняют редко, а вид карты восстанавливается
  // из данных приложения, поэтому это проще, чем обновлять каждую кнопку
  useEffect(() => {
    const container = containerRef.current
    if (!isSupported || !container) return

    const map = new Map({
      container,
      style: buildStyle(basemapRef.current),
      bounds: MOLDOVA_BOUNDS,
      fitBoundsOptions: { padding: 16 },
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: MOLDOVA_MAX_BOUNDS,
      attributionControl: { compact: true },
      locale: {
        'Map.Title': t('map.label'),
        'NavigationControl.ZoomIn': t('map.zoomIn'),
        'NavigationControl.ZoomOut': t('map.zoomOut'),
        'NavigationControl.ResetBearing': t('map.resetBearing'),
        'FullscreenControl.Enter': t('map.fullscreenEnter'),
        'FullscreenControl.Exit': t('map.fullscreenExit'),
        'AttributionControl.ToggleAttribution': t('map.attribution'),
      },
    })

    map.addControl(new NavigationControl({ visualizePitch: true }))
    map.addControl(new FullscreenControl())
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left')

    mapRef.current = map

    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [isSupported, t, i18n.resolvedLanguage])

  useEffect(() => {
    basemapRef.current = basemap
    const map = mapRef.current
    if (!map) return

    const apply = () => {
      for (const [layerId, visibility] of basemapVisibility(basemap)) {
        map.setLayoutProperty(layerId, 'visibility', visibility)
      }
    }
    // Стиль загружается не мгновенно: выбор, сделанный раньше, применится после
    if (map.isStyleLoaded()) apply()
    else map.once('style.load', apply)
  }, [basemap])

  if (!isSupported) {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center justify-center rounded-lg border border-line bg-muted p-6 text-center text-ink-muted',
          className,
        )}
      >
        {t('map.unsupported')}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-line',
        className,
      )}
    >
      <div ref={containerRef} className="size-full" />
      <BasemapSwitcher
        value={basemap}
        onChange={setBasemap}
        className="absolute top-2.5 left-2.5"
      />
    </div>
  )
}
