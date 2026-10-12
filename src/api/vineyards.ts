import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MultiPolygon, Polygon } from 'geojson'
import { api } from './client'

// Ответ бэкенда (backend/pr-026, pr-029): контур всегда MultiPolygon в WGS84
export type Vineyard = {
  id: string
  name: string
  geometry: MultiPolygon
  // Площадь по PostGIS (backend/pr-029), в гектарах
  area_ha: number
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

type Page<T> = {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Больше за один запрос API не отдаёт (MAX_PAGE_SIZE на бэкенде)
const PAGE_SIZE = 100

// Карте нужны все участки сразу, поэтому страницы загружаются подряд.
// У виноградаря их единицы или десятки — обычно хватает одного запроса
export async function fetchAllVineyards() {
  const vineyards: Vineyard[] = []
  for (let page = 1; ; page++) {
    const { data } = await api.get<Page<Vineyard>>('/vineyards', {
      params: { page, size: PAGE_SIZE },
    })
    vineyards.push(...data.items)
    if (page >= data.pages) return vineyards
  }
}

export function useVineyards() {
  return useQuery({ queryKey: vineyardKeys.all, queryFn: fetchAllVineyards })
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
