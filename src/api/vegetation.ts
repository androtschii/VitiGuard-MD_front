import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export type IndexValue = {
  mean: number
  min: number
  max: number
  std: number
}

export type LngLat = [number, number]

// Углы картограммы NDVI (backend/pr-063) в порядке слоя-картинки MapLibre:
// верхний левый, верхний правый, нижний правый, нижний левый
export type NdviMap = { corners: [LngLat, LngLat, LngLat, LngLat] }

// Снимок Sentinel-2 по участку (backend/pr-069). Без индексов — участок был
// закрыт облаками: снимок показывается, чтобы было видно, откуда пропуск
export type VegetationObservation = {
  id: string
  acquired_at: string
  platform: string | null
  scene_cloud_cover: number
  parcel_cloud_cover: number | null
  ndvi: IndexValue | null
  ndre: IndexValue | null
  ndvi_map: NdviMap | null
}

export const vegetationKey = (id: string) =>
  ['vineyards', id, 'vegetation'] as const

// Картинка — с заголовком авторизации, поэтому не ссылкой в слое карты, а файлом.
// Снимок не меняется, и загруженная картинка не перезапрашивается
export function useNdviImage(vineyardId: string, scanId: string | undefined) {
  return useQuery({
    queryKey: [...vegetationKey(vineyardId), scanId, 'ndvi'],
    queryFn: async () => {
      const { data } = await api.get<Blob>(
        `/vineyards/${vineyardId}/vegetation/${scanId}/ndvi.png`,
        { responseType: 'blob' },
      )
      return data
    },
    enabled: scanId !== undefined,
    staleTime: Infinity,
  })
}

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

// Снимок с просадкой NDVI ниже нормы участка и соседей (backend/pr-065)
export type NdviAnomaly = {
  acquired_at: string
  ndvi: number
  below_norm: number
  below_peers: number | null
  z: number
  level: 'suspected' | 'confirmed'
}

export function useNdviAnomalies(id: string) {
  return useQuery({
    queryKey: [...vegetationKey(id), 'anomalies'],
    queryFn: async () => {
      const { data } = await api.get<NdviAnomaly[]>(
        `/vineyards/${id}/vegetation/anomalies`,
      )
      return data
    },
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
