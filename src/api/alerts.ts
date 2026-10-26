import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { RiskDisease, RiskLevel } from './risks'
import { api } from './client'
import type { Page } from './vineyards'

// Предупреждение о риске болезни на участке на день (backend/pr-080)
export type Alert = {
  id: string
  created_at: string
  updated_at: string
  vineyard_id: string
  vineyard_name: string
  disease: RiskDisease
  day: string
  level: RiskLevel
  read_at: string | null
  // День после сегодняшнего — риск по прогнозу погоды
  forecast: boolean
}

export const alertsKey = ['alerts'] as const
export const ALERTS_PAGE_SIZE = 20

export function useAlerts(
  unread: boolean,
  page: number,
  size = ALERTS_PAGE_SIZE,
) {
  return useQuery({
    queryKey: [...alertsKey, 'list', unread, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<Alert>>('/alerts', {
        params: { unread: unread || undefined, page, size },
      })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

// Число непрочитанных для значка в шапке. Обычно его присылает WebSocket
// (useAlertsSocket); опрос раз в минуту — запасной путь, пока соединения нет
export const unreadAlertsKey = [...alertsKey, 'unread-count'] as const

// polling — опрос, пока нет WebSocket (useAlertsSocket)
export function useUnreadAlerts(polling = true) {
  return useQuery({
    queryKey: unreadAlertsKey,
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>('/alerts/unread-count')
      return data.count
    },
    refetchInterval: polling ? 60_000 : false,
  })
}

export function useReadAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/alerts/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertsKey }),
  })
}

export function useReadAllAlerts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/alerts/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertsKey }),
  })
}
