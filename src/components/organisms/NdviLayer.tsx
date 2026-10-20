import type { Map } from 'maplibre-gl'
import { useEffect } from 'react'
import { useNdviImage, useVegetation } from '@/api/vegetation'
import { useVineyards } from '@/api/vineyards'
import { useMap } from '@/lib/mapContext'
import { latestNdviMap, ndviLayerId } from '@/lib/ndviLayer'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { filterVineyards } from '@/lib/vineyardFilter'
import { useMapStore } from '@/store/map'

// Над заливкой участка, под его контуром и подписью: граница участка видна поверх снимка
const BEFORE_LAYER = 'vineyards-outline'

function ParcelNdvi({ map, vineyardId }: { map: Map; vineyardId: string }) {
  const { data: observations } = useVegetation(vineyardId)
  const latest = observations ? latestNdviMap(observations) : null
  const { data: image } = useNdviImage(vineyardId, latest?.id)
  const url = useObjectUrl(image)
  const corners = latest?.ndvi_map?.corners
  const opacity = useMapStore((state) => state.ndviOpacity)

  useEffect(() => {
    if (!url || !corners) return
    const id = ndviLayerId(vineyardId)
    map.addSource(id, { type: 'image', url, coordinates: corners })
    map.addLayer(
      {
        id,
        type: 'raster',
        source: id,
        paint: {
          'raster-opacity': useMapStore.getState().ndviOpacity,
          // Пиксель снимка — 10 м: сглаживание выдумало бы детали, которых нет
          'raster-resampling': 'nearest',
          'raster-fade-duration': 0,
        },
      },
      map.getLayer(BEFORE_LAYER) ? BEFORE_LAYER : undefined,
    )
    return () => {
      try {
        map.removeLayer(id)
        map.removeSource(id)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
  }, [map, vineyardId, url, corners])

  // Слайдер меняет только прозрачность: картинка не загружается заново
  useEffect(() => {
    const id = ndviLayerId(vineyardId)
    if (map.getLayer(id)) map.setPaintProperty(id, 'raster-opacity', opacity)
  }, [map, vineyardId, opacity])

  return null
}

// Картограмма последнего снимка без облаков над каждым участком из фильтра.
// Историю снимков каждого участка карта берёт из того же кэша, что окно динамики
export function NdviLayer() {
  const map = useMap()
  const isEnabled = useMapStore((state) => state.showNdvi)
  const filter = useMapStore((state) => state.filter)
  const { data: vineyards } = useVineyards()

  if (!map || !isEnabled || !vineyards) return null
  return filterVineyards(vineyards, filter).map((vineyard) => (
    <ParcelNdvi key={vineyard.id} map={map} vineyardId={vineyard.id} />
  ))
}
