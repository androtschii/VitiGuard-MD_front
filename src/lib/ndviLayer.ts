import type { VegetationObservation } from '@/api/vegetation'

export const NDVI_OPACITY = 0.85

// Палитра картограммы на сервере (RdYlGn, 0..1) — для легенды
export const NDVI_GRADIENT =
  'linear-gradient(to right, #a50026, #f46d43, #fee08b, #a6d96a, #1a9850, #006837)'

// День снимка YYYY-MM-DD по UTC: снимки Sentinel-2 над Молдовой — около 9 утра UTC
export const scanDay = (observation: VegetationObservation) =>
  observation.acquired_at.slice(0, 10)

// Последний снимок участка с картограммой не позже дня until (null — без
// ограничения): облачные снимки картограммы не имеют
export function latestNdviMap(
  observations: VegetationObservation[],
  until: string | null = null,
) {
  for (let index = observations.length - 1; index >= 0; index--) {
    const observation = observations[index]
    if (
      observation.ndvi_map &&
      (until === null || scanDay(observation) <= until)
    )
      return observation
  }
  return null
}

// Дни, в которые хотя бы у одного участка есть картограмма, по возрастанию
export function ndviDays(
  histories: (VegetationObservation[] | undefined)[],
): string[] {
  const days = new Set<string>()
  for (const history of histories) {
    for (const observation of history ?? []) {
      if (observation.ndvi_map) days.add(scanDay(observation))
    }
  }
  return [...days].sort()
}

export const ndviLayerId = (vineyardId: string) => `ndvi-${vineyardId}`
