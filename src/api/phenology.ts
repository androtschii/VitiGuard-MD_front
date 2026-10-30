import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// Основные фазы шкалы Эйхгорна–Ленца, по порядку сезона
export const STAGES = [1, 4, 12, 19, 23, 27, 31, 35, 38, 43] as const
export type Stage = (typeof STAGES)[number]

export type PhenologyObservation = {
  id: string
  vineyard_id: string
  observed_on: string
  stage: Stage
  created_at: string
  updated_at: string
}

const phenologyKey = (id: string) => ['vineyards', id, 'phenology'] as const

export function usePhenology(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: phenologyKey(vineyardId),
    queryFn: async () => {
      const { data } = await api.get<PhenologyObservation[]>(
        `/vineyards/${vineyardId}/phenology`,
      )
      return data
    },
    staleTime: 5 * 60_000,
    enabled,
  })
}

export function useSavePhenology(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { observed_on: string; stage: Stage }) =>
      api.post(`/vineyards/${vineyardId}/phenology`, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: phenologyKey(vineyardId) }),
  })
}

export function useDeletePhenology(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/vineyards/${vineyardId}/phenology/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: phenologyKey(vineyardId) }),
  })
}
