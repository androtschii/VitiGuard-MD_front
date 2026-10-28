import { Popup, type MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useVineyards } from '@/api/vineyards'
import { VineyardCard } from '@/components/organisms/VineyardCard'
import { useMap } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'

const LAYER = 'vineyards-fill'
// На сколько пикселей ниже центра карты оказывается выбранная точка
const POPUP_SHIFT = 160
// Сколько места над точкой занимает не сама карточка: внутренние отступы
// попапа, его хвостик и отступ от точки, плюс зазор до верхнего края карты
const POPUP_MARGIN = 72
// На низкой карте карточка не сжимается меньше этого: её всё равно прокручивают
const MIN_POPUP_HEIGHT = 160

function vineyardId(event: MapLayerMouseEvent) {
  const id: unknown = event.features?.[0]?.properties.id
  return typeof id === 'string' ? id : null
}

// Наведение на участок — подсказка с названием, клик — попап с карточкой
// участка. Содержимое попапа рисует React через портал, поэтому оно
// переводится и оформляется так же, как остальной интерфейс
export function VineyardPopups() {
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
    // Карточка всегда над точкой клика, а карта сдвигается так, чтобы точка
    // оказалась ниже центра: иначе высокая карточка обрезалась бы краем карты
    const popup = new Popup({ maxWidth: '300px', offset: 8, anchor: 'bottom' })
      .setLngLat(selection.lngLat)
      .setDOMContent(container)
      .addTo(map)
    map.easeTo({
      center: selection.lngLat,
      offset: [0, POPUP_SHIFT],
      duration: 300,
    })
    // Попап закрывают крестиком, кликом мимо или Esc — выбор сбрасывается
    popup.on('close', () => select(null))
    return () => {
      popup.remove()
    }
  }, [map, selection, select, container])

  const vineyard = selection
    ? vineyards?.find((item) => item.id === selection.id)
    : undefined
  if (!selection || !vineyard) return null

  // Карточка выше места над точкой обрезалась бы краем карты: её высота
  // ограничена этим местом, остальное прокручивается внутри карточки
  const above = map ? map.getContainer().clientHeight / 2 + POPUP_SHIFT : 0
  const maxHeight = Math.max(above - POPUP_MARGIN, MIN_POPUP_HEIGHT)

  return createPortal(
    <div style={{ maxHeight, overflowY: 'auto' }}>
      <VineyardCard
        vineyard={vineyard}
        point={selection.lngLat}
        onDeleted={() => select(null)}
      />
    </div>,
    container,
  )
}
