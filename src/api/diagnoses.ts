import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Disease, DiseaseProbability } from './diagnosis'
import { api } from './client'
import type { Page } from './vineyards'

// Проверка из истории (backend: /diagnoses, pr-053)
export type DiagnosisRecord = {
  id: string
  created_at: string
  updated_at: string
  vineyard_id: string | null
  vineyard_name: string | null
  model: string
  model_version: string
  disease: Disease
  confidence: number
  top: DiseaseProbability[]
  // Доля поражённой площади листа (backend/pr-048); null — без маски
  severity: number | null
  // Сохранённые наложения (backend/pr-050)
  overlays: ('heatmap' | 'lesion')[]
  // Где снято фото, по EXIF (backend/pr-051)
  location: { lat: number; lon: number } | null
  // Заключение агронома (pr-044); null — ещё не смотрел
  review: {
    disease: Disease
    comment: string | null
    reviewed_at: string
    reviewer: string | null
  } | null
}

export type DiagnosisFilters = {
  disease?: Disease | ''
  vineyardId?: string
  dateFrom?: string
  dateTo?: string
}

export const PAGE_SIZE = 12

export const diagnosesKey = ['diagnoses'] as const

export async function fetchDiagnoses(filters: DiagnosisFilters, page: number) {
  const { data } = await api.get<Page<DiagnosisRecord>>('/diagnoses', {
    params: {
      page,
      size: PAGE_SIZE,
      disease: filters.disease || undefined,
      vineyard_id: filters.vineyardId || undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
    },
  })
  return data
}

export function useDiagnoses(filters: DiagnosisFilters, page: number) {
  return useQuery({
    queryKey: [...diagnosesKey, filters, page],
    queryFn: () => fetchDiagnoses(filters, page),
    // При смене страницы прежняя видна, пока грузится следующая
    placeholderData: keepPreviousData,
  })
}

// Фото — с заголовком авторизации, поэтому не ссылкой в <img>, а файлом
export function useDiagnosisImage(id: string) {
  return useQuery({
    queryKey: [...diagnosesKey, id, 'image'],
    queryFn: async () => {
      const { data } = await api.get<Blob>(`/diagnoses/${id}/image`, {
        responseType: 'blob',
      })
      return data
    },
    staleTime: Infinity,
  })
}

export async function fetchLesionMask(id: string) {
  const { data } = await api.get<Blob>(`/diagnoses/${id}/overlays/lesion`, {
    responseType: 'blob',
  })
  return data
}

export function useDeleteDiagnosis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/diagnoses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diagnosesKey }),
  })
}

export function useReviewDiagnosis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      disease,
      comment,
    }: {
      id: string
      disease: Disease
      comment: string | null
    }) => api.put(`/diagnoses/${id}/review`, { disease, comment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diagnosesKey }),
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/diagnoses/${id}/review`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diagnosesKey }),
  })
}
