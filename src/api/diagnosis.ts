import { useMutation } from '@tanstack/react-query'
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
}

export async function diagnoseLeaf(image: File) {
  const form = new FormData()
  form.append('image', image)
  const { data } = await api.post<Diagnosis>('/ai/diagnose', form, {
    // Все классы: на графике видно, между чем колебалась модель
    params: { top_k: DISEASES.length },
    // Первый запрос после запуска сервера ещё и загружает модель
    timeout: 60_000,
  })
  return data
}

export function useDiagnose() {
  return useMutation({ mutationFn: diagnoseLeaf })
}
