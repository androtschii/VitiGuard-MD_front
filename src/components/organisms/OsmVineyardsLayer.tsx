import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { GeoJSONSource, LayerSpecification } from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { fetchOsmVineyards } from '@/api/osm'
import { useMap } from '@/lib/mapContext'
import { OSM_MIN_ZOOM, osmBbox } from '@/lib/osmLayer'
import { useMapStore } from '@/store/map'

const SOURCE = 'osm-vineyards'
const EMPTY = { type: 'FeatureCollection' as const, features: [] }

// Справочный слой — светлее и тоньше участков пользователя, чтобы не спорить с ними
const layers: LayerSpecification[] = [
  {
    id: 'osm-vineyards-fill',
    type: 'fill',
    source: SOURCE,
    paint: { 'fill-color': '#a68af0', 'fill-opacity': 0.18 },
  },
  {
    id: 'osm-vineyards-outline',
    type: 'line',
    source: SOURCE,
    paint: {
      'line-color': '#7e50d6',
      'line-width': 1,
      'line-dasharray': [2, 1],
    },
  },
]

// Виноградники Молдовы из OpenStreetMap (backend/pr-033). Их 17 тысяч, поэтому
// загружается только окно карты, только на крупном масштабе и только когда
// пользователь включил слой; уже загруженные окна берутся из кэша
export function OsmVineyardsLayer() {
  const map = useMap()
  const isEnabled = useMapStore((state) => state.showOsm)
  const setTooFar = useMapStore((state) => state.setOsmTooFar)
  const [bbox, setBbox] = useState<string | null>(null)

  useEffect(() => {
    if (!map || !isEnabled) return
    // Слои — под участками пользователя, если те уже на карте
    const beforeId = map.getLayer('vineyards-fill')
      ? 'vineyards-fill'
      : undefined
    map.addSource(SOURCE, { type: 'geojson', data: EMPTY })
    for (const layer of layers) map.addLayer(layer, beforeId)

    const onMove = () => {
      const near = map.getZoom() >= OSM_MIN_ZOOM
      setTooFar(!near)
      setBbox(near ? osmBbox(map.getBounds()) : null)
    }
    // Первое окно — когда карта отрисована, дальше — после каждого сдвига
    map.once('idle', onMove)
    map.on('moveend', onMove)

    return () => {
      map.off('moveend', onMove)
      setTooFar(false)
      setBbox(null)
      try {
        for (const layer of [...layers].reverse()) map.removeLayer(layer.id)
        map.removeSource(SOURCE)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
  }, [map, isEnabled, setTooFar])

  const { data } = useQuery({
    queryKey: ['osm-vineyards', bbox],
    queryFn: () => fetchOsmVineyards(bbox ?? ''),
    enabled: bbox !== null,
    // Пока грузится новое окно, на карте остаются полигоны предыдущего
    placeholderData: keepPreviousData,
    staleTime: 10 * 60_000,
  })

  useEffect(() => {
    if (!map || !isEnabled) return
    void map
      .getSource<GeoJSONSource>(SOURCE)
      ?.setData(bbox && data ? data : EMPTY)
  }, [map, isEnabled, bbox, data])

  return null
}
