import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export type RiskLevel = 'low' | 'medium' | 'high'
export type RiskDisease = 'downy_mildew' | 'powdery_mildew'
export type RiskMethod = 'three_tens' | 'goidanich' | 'gubler_thomas'

// Риск по одной агромодели на дату (backend/pr-077). Дни после сегодняшнего
// посчитаны по прогнозу погоды — factors.forecast
export type RiskEntry = {
  target_date: string
  disease: RiskDisease
  method: RiskMethod
  score: number
  level: RiskLevel
  factors: Record<string, unknown> | null
  updated_at: string
}

// Вероятность вспышки милдью и оидиума по ансамблю ICON-EPS (backend/pr-077).
// null означает «вне сезона», а не ноль.
export type OutlookDay = {
  day: string
  downy: number | null
  powdery: number | null
}

export type RiskOutlook = {
  members: number
  days: OutlookDay[]
  downy_week: number | null
  powdery_week: number | null
}

const risksKey = (id: string) => ['vineyards', id, 'risks'] as const
export const outlookKey = (id: string) =>
  ['vineyards', id, 'risks', 'outlook'] as const

export async function fetchRisks(id: string) {
  const { data } = await api.get<RiskEntry[]>(`/vineyards/${id}/risks`)
  return data
}

export function useRisks(id: string) {
  return useQuery({
    queryKey: risksKey(id),
    queryFn: () => fetchRisks(id),
    // Риск пересчитывается по расписанию раз в несколько часов
    staleTime: 30 * 60_000,
  })
}

export async function fetchRiskOutlook(id: string) {
  const { data } = await api.get<RiskOutlook>(`/vineyards/${id}/risks/outlook`)
  return data
}

export function useRiskOutlook(id: string, enabled = true) {
  return useQuery({
    queryKey: outlookKey(id),
    queryFn: () => fetchRiskOutlook(id),
    staleTime: 30 * 60_000,
    enabled,
  })
}

// Пересчёт по свежей погоде и прогнозу идёт на сервере секунды и сразу
// возвращает новый риск сезона
export async function refreshRisks(id: string) {
  const { data } = await api.post<RiskEntry[]>(`/vineyards/${id}/risks/refresh`)
  return data
}

export function useRefreshRisks(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => refreshRisks(id),
    onSuccess: (data) => {
      queryClient.setQueryData(risksKey(id), data)
      void queryClient.invalidateQueries({ queryKey: outlookKey(id) })
    },
  })
}

// Уровни на сегодня по всем участкам пользователя (backend/pr-079) — для
// раскраски карты. Участков без оценки (вне сезона) в ответе нет
export type TodayRisk = {
  vineyard_id: string
  day: string
  downy: RiskLevel
  powdery: RiskLevel
}

export async function fetchTodayRisks() {
  const { data } = await api.get<TodayRisk[]>('/risks/today')
  return data
}

export function useTodayRisks() {
  return useQuery({
    queryKey: ['risks', 'today'],
    queryFn: fetchTodayRisks,
    // Сервер пересчитывает риск раз в 6 часов
    staleTime: 30 * 60_000,
  })
}
