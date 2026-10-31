import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export type Harvest = {
  id: string
  vineyard_id: string
  season: number
  estimated_kg: number | null
  actual_kg: number | null
  sugar_brix: number | null
  created_at: string
  updated_at: string
}

export type HarvestInput = Pick<
  Harvest,
  'season' | 'estimated_kg' | 'actual_kg' | 'sugar_brix'
>

const harvestsKey = (id: string) => ['vineyards', id, 'harvests'] as const

// Прогноз по подсчёту в поле: кусты × грозди на кусте × вес грозди
export function estimateKg(vines: number, bunches: number, bunchGrams: number) {
  return (vines * bunches * bunchGrams) / 1000
}

export function useHarvests(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: harvestsKey(vineyardId),
    queryFn: async () => {
      const { data } = await api.get<Harvest[]>(
        `/vineyards/${vineyardId}/harvests`,
      )
      return data
    },
    staleTime: 5 * 60_000,
    enabled,
  })
}

export function useSaveHarvest(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HarvestInput) =>
      api.post(`/vineyards/${vineyardId}/harvests`, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: harvestsKey(vineyardId) }),
  })
}

export function useDeleteHarvest(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/vineyards/${vineyardId}/harvests/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: harvestsKey(vineyardId) }),
  })
}
