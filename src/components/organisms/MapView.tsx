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
import { cn } from '@/lib/cn'
import {
  MAX_ZOOM,
  MIN_ZOOM,
  MOLDOVA_BOUNDS,
  MOLDOVA_MAX_BOUNDS,
  baseStyle,
  supportsWebGL,
} from '@/lib/map'

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

  // Карта пересоздаётся при смене языка: подписи кнопок MapLibre задаются
  // только при создании. Язык меняют редко, а вид карты восстанавливается
  // из данных приложения, поэтому это проще, чем обновлять каждую кнопку
  useEffect(() => {
    const container = containerRef.current
    if (!isSupported || !container) return

    const map = new Map({
      container,
      style: baseStyle,
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

    return () => map.remove()
  }, [isSupported, t, i18n.resolvedLanguage])

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
      ref={containerRef}
      className={cn('overflow-hidden rounded-lg border border-line', className)}
    />
  )
}
