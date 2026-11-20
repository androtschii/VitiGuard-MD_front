import { useQuery } from '@tanstack/react-query'
import { api } from './client'

// Оценка фенологической фазы лозы по сумме активных температур (GDD)
export type PhenologyEstimate = {
  current_bbch: number
  current_stage_name: string
  accumulated_gdd: number
  next_bbch: number | null
  next_stage_name: string | null
  gdd_to_next: number
  progress_percentage: number
  is_season_complete: boolean
  variety_name: string
}

// Биоклиматический индекс Винклера
export type WinklerIndex = {
  gdd_sum: number
  region_class: string
  region_title: string
  suitable_varieties: string[]
}

// Гелиотермический индекс Гуглина
export type HuglinIndex = {
  hi_value: number
  thermal_class: string
  thermal_description: string
}

// Индекс прохладных ночей (CI)
export type CoolNightIndex = {
  ci_temperature: number
  night_class: string
  aroma_color_potential: string
}

// Гидротермический коэффициент Селянинова (ГТК)
export type SelyaninovHtc = {
  htc_value: number
  moisture_class: string
  irrigation_need: string
}

// Комплексный биоклиматический профиль терруара
export type TerroirBioclimaticProfile = {
  winkler: WinklerIndex
  huglin: HuglinIndex
  cool_night: CoolNightIndex
  selyaninov: SelyaninovHtc
}

export async function fetchPhenologyEstimate(
  vineyardId: string,
): Promise<PhenologyEstimate> {
  const { data } = await api.get<PhenologyEstimate>(
    `/vineyards/${vineyardId}/bioclimatic/phenology-estimate`,
  )
  return data
}

export async function fetchTerroirIndices(
  vineyardId: string,
): Promise<TerroirBioclimaticProfile> {
  const { data } = await api.get<TerroirBioclimaticProfile>(
    `/vineyards/${vineyardId}/bioclimatic/indices`,
  )
  return data
}

export const bioclimaticKeys = {
  phenology: (id: string) =>
    ['vineyards', id, 'bioclimatic', 'phenology-estimate'] as const,
  indices: (id: string) => ['vineyards', id, 'bioclimatic', 'indices'] as const,
}

// Хук оценки текущей фазы BBCH
export function usePhenologyEstimate(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: bioclimaticKeys.phenology(vineyardId),
    queryFn: () => fetchPhenologyEstimate(vineyardId),
    staleTime: 5 * 60_000,
    enabled: Boolean(vineyardId) && enabled,
  })
}

// Хук расчёта биоклиматических индексов терруара
export function useTerroirIndices(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: bioclimaticKeys.indices(vineyardId),
    queryFn: () => fetchTerroirIndices(vineyardId),
    staleTime: 5 * 60_000,
    enabled: Boolean(vineyardId) && enabled,
  })
}
