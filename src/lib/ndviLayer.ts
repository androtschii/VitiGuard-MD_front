import type { VegetationObservation } from '@/api/vegetation'

export const NDVI_OPACITY = 0.85

// Палитра картограммы на сервере (RdYlGn, 0..1) — для легенды
export const NDVI_GRADIENT =
  'linear-gradient(to right, #a50026, #f46d43, #fee08b, #a6d96a, #1a9850, #006837)'

// Последний снимок участка с картограммой: облачные снимки её не имеют
export function latestNdviMap(observations: VegetationObservation[]) {
  for (let index = observations.length - 1; index >= 0; index--) {
    if (observations[index].ndvi_map) return observations[index]
  }
  return null
}

export const ndviLayerId = (vineyardId: string) => `ndvi-${vineyardId}`
