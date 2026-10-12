import { Popup, type MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useVineyards } from '@/api/vineyards'
import { useMap } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'

const LAYER = 'vineyards-fill'

function vineyardId(event: MapLayerMouseEvent) {
  const id: unknown = event.features?.[0]?.properties.id
  return typeof id === 'string' ? id : null
}

// Наведение на участок — подсказка с названием, клик — попап с площадью и
// датой. Содержимое попапа рисует React через портал, поэтому оно
// переводится и оформляется так же, как остальной интерфейс
export function VineyardPopups() {
  const { t, i18n } = useTranslation()
  const map = useMap()
  const { data: vineyards } = useVineyards()
  const selection = useMapStore((state) => state.selection)
  const select = useMapStore((state) => state.select)
  const [container] = useState(() => document.createElement('div'))

  useEffect(() => {
    if (!map) return
    const tooltip = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 8,
    })

    const onMove = (event: MapLayerMouseEvent) => {
      if (useMapStore.getState().isDrawing) return
      const name: unknown = event.features?.[0]?.properties.name
      map.getCanvas().style.cursor = 'pointer'
      tooltip
        .setLngLat(event.lngLat)
        .setText(typeof name === 'string' ? name : '')
        .addTo(map)
    }
    const onLeave = () => {
      map.getCanvas().style.cursor = ''
      tooltip.remove()
    }
    const onClick = (event: MapLayerMouseEvent) => {
      const id = vineyardId(event)
      if (!id || useMapStore.getState().isDrawing) return
      tooltip.remove()
      useMapStore
        .getState()
        .select({ id, lngLat: [event.lngLat.lng, event.lngLat.lat] })
    }

    map.on('mousemove', LAYER, onMove)
    map.on('mouseleave', LAYER, onLeave)
    map.on('click', LAYER, onClick)
    return () => {
      map.off('mousemove', LAYER, onMove)
      map.off('mouseleave', LAYER, onLeave)
      map.off('click', LAYER, onClick)
      tooltip.remove()
    }
  }, [map])

  useEffect(() => {
    if (!map || !selection) return
    const popup = new Popup({ maxWidth: '260px', offset: 8 })
      .setLngLat(selection.lngLat)
      .setDOMContent(container)
      .addTo(map)
    // Попап закрывают крестиком, кликом мимо или Esc — выбор сбрасывается
    popup.on('close', () => select(null))
    return () => {
      popup.remove()
    }
  }, [map, selection, select, container])

  const vineyard = vineyards?.find((item) => item.id === selection?.id)
  if (!vineyard) return null

  const area = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 2,
  }).format(vineyard.area_ha)
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'long',
  }).format(new Date(vineyard.created_at))

  return createPortal(
    <div className="flex flex-col gap-1 pr-4 text-sm">
      <h2 className="font-semibold text-ink">{vineyard.name}</h2>
      <p>{t('vineyard.area', { area })}</p>
      <p className="text-ink-muted">{t('vineyard.addedOn', { date })}</p>
    </div>,
    container,
  )
}
