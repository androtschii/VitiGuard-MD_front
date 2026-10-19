import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// Классы модели диагностики (backend/pr-043) в порядке её выходов
export const DISEASES = [
  'healthy',
  'black_rot',
  'esca',
  'leaf_blight',
  'downy_mildew',
  'powdery_mildew',
] as const

export type Disease = (typeof DISEASES)[number]

export type DiseaseProbability = {
  disease: Disease
  probability: number
}

export type Diagnosis = {
  model: string
  disease: Disease
  confidence: number
  // Уверенность ниже порога сервера: ответ стоит перепроверить
  low_confidence: boolean
  top: DiseaseProbability[]
  // Наложения поверх фото — прозрачные PNG (data URL) в пропорциях фото
  // (backend/pr-046, pr-047); null, если модели нет на сервере
  heatmap: string | null
  lesion: { mask: string; severity: number } | null
  // Запись в истории проверок; нет — фото не сохранялось
  id?: string | null
}

export type DiagnoseInput = {
  image: File
  // Сохранить фото и результат в историю (pr-047) и к какому участку
  save?: boolean
  vineyardId?: string | null
}

export async function diagnoseLeaf({ image, save, vineyardId }: DiagnoseInput) {
  const form = new FormData()
  form.append('image', image)
  const { data } = await api.post<Diagnosis>('/ai/diagnose', form, {
    // Все классы: на графике видно, между чем колебалась модель
    params: {
      top_k: DISEASES.length,
      save: save || undefined,
      vineyard_id: (save && vineyardId) || undefined,
    },
    // Первый запрос после запуска сервера ещё и загружает модель
    timeout: 60_000,
  })
  return data
}

export function useDiagnose() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: diagnoseLeaf,
    // Новая запись в истории
    onSuccess: (data) => {
      if (data.id)
        void queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
    },
  })
}
