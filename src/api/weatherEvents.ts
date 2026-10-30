import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export const EVENT_KINDS = ['frost', 'hail', 'wind', 'drought', 'heat'] as const
export type EventKind = (typeof EVENT_KINDS)[number]
export type Severity = 1 | 2 | 3

export type WeatherEvent = {
  id: string
  vineyard_id: string
  occurred_on: string
  kind: EventKind
  severity: Severity
  note: string | null
  created_at: string
  updated_at: string
}

const eventsKey = (id: string) => ['vineyards', id, 'weather-events'] as const

export function useWeatherEvents(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: eventsKey(vineyardId),
    queryFn: async () => {
      const { data } = await api.get<WeatherEvent[]>(
        `/vineyards/${vineyardId}/weather-events`,
      )
      return data
    },
    staleTime: 5 * 60_000,
    enabled,
  })
}

export function useCreateWeatherEvent(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      occurred_on: string
      kind: EventKind
      severity: Severity
      note: string | null
    }) => api.post(`/vineyards/${vineyardId}/weather-events`, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: eventsKey(vineyardId) }),
  })
}

export function useDeleteWeatherEvent(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/vineyards/${vineyardId}/weather-events/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: eventsKey(vineyardId) }),
  })
}
