import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './client'
import type { Page } from './vineyards'

export type VineLabel = 'trunk' | 'bunch'

export type VineDetection = {
  label: VineLabel
  confidence: number
  // Рамка x1, y1, x2, y2 в долях ширины и высоты снимка
  box: [number, number, number, number]
}

// Стволы и грозди на фото ряда (backend sprint-32): та же модель, что у робота
export type VineResult = {
  model: string
  version: string
  image_width: number
  image_height: number
  trunks: number
  bunches: number
  detections: VineDetection[]
  // Запись в истории; нет — фото не сохранялось
  id?: string | null
}

// Анализ ряда из истории (backend: /vine-checks)
export type VineCheck = {
  id: string
  created_at: string
  updated_at: string
  vineyard_id: string | null
  vineyard_name: string | null
  model: string
  image_width: number
  image_height: number
  trunks: number
  bunches: number
  detections: VineDetection[]
}

export type DetectVineInput = {
  image: File
  save?: boolean
  vineyardId?: string | null
}

export const vineChecksKey = ['vine-checks'] as const
const PAGE_SIZE = 12

export async function detectVine({ image, save, vineyardId }: DetectVineInput) {
  const form = new FormData()
  form.append('image', image)
  const { data } = await api.post<VineResult>('/ai/vine/detect', form, {
    params: {
      save: save || undefined,
      vineyard_id: (save && vineyardId) || undefined,
    },
    // Первый запрос после запуска сервера ещё и загружает модель
    timeout: 60_000,
  })
  return data
}

export function useDetectVine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: detectVine,
    onSuccess: (data) => {
      if (data.id)
        void queryClient.invalidateQueries({ queryKey: vineChecksKey })
    },
  })
}

export function useVineChecks(page: number) {
  return useQuery({
    queryKey: [...vineChecksKey, page],
    queryFn: async () => {
      const { data } = await api.get<Page<VineCheck>>('/vine-checks', {
        params: { page, size: PAGE_SIZE },
      })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

// Фото — с заголовком авторизации, поэтому не ссылкой в <img>, а файлом
export function useVineCheckImage(id: string) {
  return useQuery({
    queryKey: [...vineChecksKey, id, 'image'],
    queryFn: async () => {
      const { data } = await api.get<Blob>(`/vine-checks/${id}/image`, {
        responseType: 'blob',
      })
      return data
    },
    staleTime: Infinity,
  })
}

export function useDeleteVineCheck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vine-checks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vineChecksKey }),
  })
}
