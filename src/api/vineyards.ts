import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type { MultiPolygon, Polygon } from 'geojson'
import { api } from './client'
import type { Variety } from './varieties'

// Ответ бэкенда (backend/pr-026, pr-029): контур всегда MultiPolygon в WGS84
export type Vineyard = {
  id: string
  name: string
  geometry: MultiPolygon
  // Площадь по PostGIS (backend/pr-029), в гектарах
  area_ha: number
  // Сорт и год посадки (backend/pr-035) необязательны
  variety: Variety | null
  planting_year: number | null
  created_at: string
  updated_at: string
}

export type VineyardInput = {
  name: string
  geometry: MultiPolygon
  variety_id?: string | null
  planting_year?: number | null
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

function invalidateVineyards(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: vineyardKeys.all }),
    queryClient.invalidateQueries({ queryKey: ['regions'] }),
  ])
}

export function useCreateVineyard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVineyard,
    // Список участков на карте (pr-024) перезагрузится с новым участком,
    // а сводка по районам — с его площадью
    onSuccess: () => invalidateVineyards(queryClient),
  })
}

export function useUpdateVineyard(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<VineyardInput>) => updateVineyard(id, input),
    onSuccess: () => invalidateVineyards(queryClient),
  })
}

export async function deleteVineyard(id: string) {
  await api.delete(`/vineyards/${id}`)
}

export function useDeleteVineyard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteVineyard,
    onSuccess: () => invalidateVineyards(queryClient),
  })
}

// Местность вокруг участка (backend/pr-033, pr-036): район и виноградники
// OpenStreetMap рядом — соседние виноградники несут риск заражения
export type VineyardContext = {
  // Доля площади участка, которая и в OSM размечена как виноградник, 0..1
  osm_overlap_ratio: number
  osm_vineyards_within_1km: number
  nearest_osm_distance_m: number | null
  district: { iso: string; name: string } | null
}

export async function fetchVineyardContext(id: string) {
  const { data } = await api.get<VineyardContext>(`/vineyards/${id}/context`)
  return data
}

export function useVineyardContext(id: string | null) {
  return useQuery({
    queryKey: [...vineyardKeys.all, id, 'context'],
    queryFn: () => fetchVineyardContext(id ?? ''),
    enabled: id !== null,
    // Разметка OSM вокруг участка меняется редко
    staleTime: 10 * 60_000,
  })
}

export type ExportFormat = 'geojson' | 'shapefile'

// Границы участка файлом (backend/pr-032): GeoJSON или архив Shapefile для ГИС
export async function downloadVineyard(id: string, format: ExportFormat) {
  const { data } = await api.get<Blob>(`/vineyards/${id}/export`, {
    params: { format },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = `vineyard-${id}.${format === 'shapefile' ? 'zip' : 'geojson'}`
  link.click()
  URL.revokeObjectURL(url)
}
