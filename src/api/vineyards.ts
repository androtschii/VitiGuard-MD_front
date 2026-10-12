import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MultiPolygon, Polygon } from 'geojson'
import { api } from './client'

// Ответ бэкенда (backend/pr-026): контур всегда MultiPolygon в WGS84
export type Vineyard = {
  id: string
  name: string
  geometry: MultiPolygon
  created_at: string
  updated_at: string
}

export type VineyardInput = {
  name: string
  geometry: MultiPolygon
}

export const vineyardKeys = {
  all: ['vineyards'] as const,
}

// На карте рисуется один контур, а участок в базе может состоять из нескольких
export function toMultiPolygon(polygon: Polygon): MultiPolygon {
  return { type: 'MultiPolygon', coordinates: [polygon.coordinates] }
}

export async function createVineyard(input: VineyardInput) {
  const { data } = await api.post<Vineyard>('/vineyards', input)
  return data
}

export async function updateVineyard(
  id: string,
  input: Partial<VineyardInput>,
) {
  const { data } = await api.patch<Vineyard>(`/vineyards/${id}`, input)
  return data
}

export function useCreateVineyard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVineyard,
    // Список участков на карте (pr-024) перезагрузится с новым участком
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vineyardKeys.all }),
  })
}

export function useUpdateVineyard(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<VineyardInput>) => updateVineyard(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vineyardKeys.all }),
  })
}
