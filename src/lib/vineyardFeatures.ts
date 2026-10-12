import type { FeatureCollection, MultiPolygon } from 'geojson'
import type { Vineyard } from '@/api/vineyards'

type VineyardProperties = { id: string; name: string }

// Участки как GeoJSON для источника карты. id — в свойствах, а не в id объекта:
// MapLibre принимает там только числа, а у участков UUID
// Подписи и будущие попапы берут id и название прямо из объекта на карте
export function toFeatureCollection(
  vineyards: Vineyard[],
): FeatureCollection<MultiPolygon, VineyardProperties> {
  return {
    type: 'FeatureCollection',
    features: vineyards.map((vineyard) => ({
      type: 'Feature',
      properties: { id: vineyard.id, name: vineyard.name },
      geometry: vineyard.geometry,
    })),
  }
}
