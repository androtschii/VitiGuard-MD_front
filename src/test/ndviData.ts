import type { NdviMap, VegetationObservation } from '@/api/vegetation'
import type { Vineyard } from '@/api/vineyards'

export const corners: NdviMap['corners'] = [
  [28.8599, 47.141],
  [28.8613, 47.141],
  [28.8613, 47.1399],
  [28.8599, 47.1399],
]

export function scan(
  id: string,
  date: string,
  withMap = true,
): VegetationObservation {
  const index = { mean: 0.71, min: 0.6, max: 0.8, std: 0.05 }
  return {
    id,
    acquired_at: `${date}T09:17:00Z`,
    platform: 'sentinel-2a',
    scene_cloud_cover: 5,
    parcel_cloud_cover: withMap ? 0 : 100,
    ndvi: withMap ? index : null,
    ndre: withMap ? index : null,
    ndvi_map: withMap ? { corners } : null,
  }
}

export function vineyard(id: string, name: string): Vineyard {
  return {
    id,
    name,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [28.86, 47.14],
            [28.8613, 47.14],
            [28.8613, 47.1409],
            [28.86, 47.14],
          ],
        ],
      ],
    },
    area_ha: 1.2,
    variety: null,
    planting_year: null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  }
}
