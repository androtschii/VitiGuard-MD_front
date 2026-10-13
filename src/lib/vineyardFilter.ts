import type { Vineyard } from '@/api/vineyards'

export type VineyardFilter = {
  // id сорта, 'all' — любой сорт, 'none' — участки без указанного сорта
  variety: string
  minArea: number | null
  maxArea: number | null
}

export const NO_FILTER: VineyardFilter = {
  variety: 'all',
  minArea: null,
  maxArea: null,
}

export function isFiltered(filter: VineyardFilter) {
  return (
    filter.variety !== 'all' ||
    filter.minArea !== null ||
    filter.maxArea !== null
  )
}

// Фильтр работает на клиенте по уже загруженному списку: участков у
// пользователя десятки, и запрос к серверу на каждое изменение не нужен
export function filterVineyards(vineyards: Vineyard[], filter: VineyardFilter) {
  return vineyards.filter((vineyard) => {
    if (filter.variety === 'none' && vineyard.variety) return false
    if (
      filter.variety !== 'all' &&
      filter.variety !== 'none' &&
      vineyard.variety?.id !== filter.variety
    )
      return false
    if (filter.minArea !== null && vineyard.area_ha < filter.minArea)
      return false
    if (filter.maxArea !== null && vineyard.area_ha > filter.maxArea)
      return false
    return true
  })
}
