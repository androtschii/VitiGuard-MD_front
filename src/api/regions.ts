import { useQuery } from '@tanstack/react-query'
import { api } from './client'

// Сводка по району (backend/pr-036): виноградники OpenStreetMap и участки
// пользователя. Полигон относится к району по своей внутренней точке
export type DistrictStats = {
  iso: string
  name: string
  area_ha: number
  osm_vineyards: number
  osm_vineyard_area_ha: number
  // Доля площади района под виноградниками по OSM, 0..1
  osm_vineyard_share: number
  my_vineyards: number
  my_vineyard_area_ha: number
}

export async function fetchDistrictStats() {
  const { data } = await api.get<DistrictStats[]>('/regions/stats')
  return data
}

export function useDistrictStats() {
  return useQuery({
    queryKey: ['regions', 'stats'],
    queryFn: fetchDistrictStats,
    // Разметка OSM обновляется импортом раз в несколько недель
    staleTime: 10 * 60_000,
  })
}
