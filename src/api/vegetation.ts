import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export type IndexValue = {
  mean: number
  min: number
  max: number
  std: number
}

// Снимок Sentinel-2 по участку (backend/pr-069). Без индексов — участок был
// закрыт облаками: снимок показывается, чтобы было видно, откуда пропуск
export type VegetationObservation = {
  acquired_at: string
  platform: string | null
  scene_cloud_cover: number
  parcel_cloud_cover: number | null
  ndvi: IndexValue | null
  ndre: IndexValue | null
}

const vegetationKey = (id: string) => ['vineyards', id, 'vegetation'] as const

export async function fetchVegetation(id: string) {
  const { data } = await api.get<VegetationObservation[]>(
    `/vineyards/${id}/vegetation`,
  )
  return data
}

// Пока на сервере идёт расчёт (refreshing), история перезапрашивается раз в
// 30 секунд: снимки сохраняются по одному, и график растёт на глазах
export function useVegetation(id: string, refreshing = false) {
  return useQuery({
    queryKey: vegetationKey(id),
    queryFn: () => fetchVegetation(id),
    refetchInterval: refreshing ? 30_000 : false,
  })
}

// Расчёт индексов по новым снимкам сезона — фоновая задача (backend/pr-060)
export async function refreshVegetation(id: string) {
  const { data } = await api.post<{ task_id: string }>(
    `/vineyards/${id}/vegetation/refresh`,
  )
  return data
}

export function useRefreshVegetation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => refreshVegetation(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vegetationKey(id) }),
  })
}
