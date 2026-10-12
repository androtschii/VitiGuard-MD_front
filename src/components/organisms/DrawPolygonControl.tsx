import type { Polygon } from 'geojson'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
  ValidateNotSelfIntersecting,
  type GeoJSONStoreFeatures,
} from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'
import { polygonAreaSquareMeters, squareMetersToHectares } from '@/lib/geo'
import { useMap } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'

type DrawState = 'idle' | 'drawing' | 'drawn'

export type DrawnPolygon = {
  polygon: Polygon
  areaHa: number
  // Убирает контур с карты и возвращает панель к кнопке «Нарисовать участок»
  reset: () => void
}

type DrawPolygonControlProps = {
  onChange?: (polygon: Polygon | null) => void
  // Что показать под готовым контуром вместо площади и кнопки удаления,
  // например форму сохранения участка
  renderDrawn?: (drawn: DrawnPolygon) => ReactNode
  className?: string
}

// Цвет участков — изумрудный акцент приложения, границы районов — фиолетовые
const PARCEL = '#047857'
const PARCEL_FILL = '#10b981'

function isPolygon(
  feature: GeoJSONStoreFeatures | undefined,
): feature is GeoJSONStoreFeatures & { geometry: Polygon } {
  return feature?.geometry.type === 'Polygon'
}

export function DrawPolygonControl({
  onChange,
  renderDrawn,
  className,
}: DrawPolygonControlProps) {
  const { t, i18n } = useTranslation()
  const map = useMap()
  const drawRef = useRef<TerraDraw | null>(null)
  const featureIdRef = useRef<string | number | null>(null)
  const onChangeRef = useRef(onChange)
  const [state, setState] = useState<DrawState>('idle')
  const isDrawing = useMapStore((store) => store.isDrawing)
  const setDrawing = useMapStore((store) => store.setDrawing)
  const [areaHa, setAreaHa] = useState<number | null>(null)
  const [polygon, setPolygon] = useState<Polygon | null>(null)
  const [clearRequests, setClearRequests] = useState(0)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!map) return

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPolygonMode({
          // Самопересекающийся контур («восьмёрка») не даёт площади участка
          validation: (feature) => ValidateNotSelfIntersecting(feature),
          styles: {
            fillColor: PARCEL_FILL,
            fillOpacity: 0.3,
            outlineColor: PARCEL,
            outlineWidth: 2,
            closingPointColor: PARCEL,
            closingPointOutlineColor: '#ffffff',
          },
        }),
        new TerraDrawSelectMode({
          // Готовый контур правится перетаскиванием вершин и середин сторон
          flags: {
            polygon: {
              feature: {
                draggable: true,
                coordinates: {
                  draggable: true,
                  midpoints: true,
                  deletable: true,
                },
              },
            },
          },
          styles: {
            selectedPolygonColor: PARCEL_FILL,
            selectedPolygonFillOpacity: 0.3,
            selectedPolygonOutlineColor: PARCEL,
            selectedPolygonOutlineWidth: 2,
            selectionPointColor: PARCEL,
            selectionPointOutlineColor: '#ffffff',
            midPointColor: '#ffffff',
            midPointOutlineColor: PARCEL,
          },
        }),
      ],
    })

    const report = () => {
      const feature = draw.getSnapshotFeature(featureIdRef.current ?? '')
      if (!isPolygon(feature)) return
      setAreaHa(
        squareMetersToHectares(polygonAreaSquareMeters(feature.geometry)),
      )
      setPolygon(feature.geometry)
      onChangeRef.current?.(feature.geometry)
    }

    draw.on('finish', (id) => {
      if (!isPolygon(draw.getSnapshotFeature(id))) return
      featureIdRef.current = id
      draw.setMode('select')
      draw.selectFeature(id)
      setState('drawn')
      report()
    })
    draw.on('change', (ids, type) => {
      if (type === 'update' && ids.includes(featureIdRef.current ?? ''))
        report()
    })

    draw.start()
    drawRef.current = draw

    return () => {
      drawRef.current = null
      featureIdRef.current = null
      draw.stop()
      useMapStore.getState().setDrawing(false)
    }
  }, [map])

  useEffect(() => {
    if (clearRequests === 0) return
    // Сначала забываем контур: перед удалением Terra Draw снимает с него
    // выделение и сообщает об этом как об изменении, а изменения забытого
    // контура не должны снова передаваться наружу
    featureIdRef.current = null
    const draw = drawRef.current
    draw?.clear()
    draw?.setMode('static')
  }, [clearRequests])

  if (!map) return null

  const startDrawing = () => {
    drawRef.current?.setMode('polygon')
    setState('drawing')
    setDrawing(true)
  }

  // Сброс передаётся наружу (в renderDrawn), поэтому сам он рефов не читает:
  // очистку карты выполняет эффект по счётчику запросов
  const reset = () => {
    setAreaHa(null)
    setPolygon(null)
    setState('idle')
    setDrawing(false)
    setClearRequests((count) => count + 1)
    onChange?.(null)
  }

  const area =
    areaHa === null
      ? ''
      : new Intl.NumberFormat(i18n.resolvedLanguage, {
          maximumFractionDigits: 2,
        }).format(areaHa)

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-line bg-surface p-3 text-sm shadow-sm',
        className,
      )}
    >
      {state === 'idle' && (
        // Пока на карте работает линейка, клики заняты ей
        <Button size="sm" disabled={isDrawing} onClick={startDrawing}>
          {t('draw.start')}
        </Button>
      )}
      {state === 'drawing' && (
        <>
          <p className="text-ink-soft">{t('draw.hint')}</p>
          <Button size="sm" variant="secondary" onClick={reset}>
            {t('draw.cancel')}
          </Button>
        </>
      )}
      {state === 'drawn' &&
        renderDrawn &&
        polygon &&
        areaHa !== null &&
        renderDrawn({ polygon, areaHa, reset })}
      {state === 'drawn' && !renderDrawn && (
        <>
          {/* Площадь пересчитывается при правке контура — озвучиваем изменения */}
          <p aria-live="polite" className="font-medium text-ink">
            {t('draw.area', { area })}
          </p>
          <p className="text-ink-muted">{t('draw.editHint')}</p>
          <Button size="sm" variant="secondary" onClick={reset}>
            {t('draw.remove')}
          </Button>
        </>
      )}
    </div>
  )
}
