import { useMutation } from '@tanstack/react-query'
import { api } from './client'

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
}

export async function detectVine(image: File) {
  const form = new FormData()
  form.append('image', image)
  const { data } = await api.post<VineResult>('/ai/vine/detect', form, {
    // Первый запрос после запуска сервера ещё и загружает модель
    timeout: 60_000,
  })
  return data
}

export function useDetectVine() {
  return useMutation({ mutationFn: detectVine })
}
