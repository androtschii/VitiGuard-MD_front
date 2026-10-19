import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import wasmBinary from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'
import { useState } from 'react'
import { classifyOffline } from '@/lib/offlineClassifier'
import {
  deleteModel,
  loadModel,
  saveModel,
  type ModelMeta,
} from '@/lib/modelStore'
import { api } from './client'

// Классификатор для диагностики без сети (backend: /ai/models/classifier)
export async function fetchModelMeta() {
  const { data } = await api.get<ModelMeta>('/ai/models/classifier')
  return data
}

const storedKey = ['offline-model', 'stored'] as const

// Что лежит на устройстве: только описание, без 16 МБ байтов
export function useStoredModel() {
  return useQuery({
    queryKey: storedKey,
    queryFn: async () => (await loadModel())?.meta ?? null,
    staleTime: Infinity,
  })
}

// Версия на сервере: по ней видно, что сохранённая копия устарела
export function useServerModel(enabled: boolean) {
  return useQuery({
    queryKey: ['offline-model', 'server'],
    queryFn: fetchModelMeta,
    enabled,
    staleTime: 60 * 60_000,
    retry: false,
  })
}

export function useDownloadModel() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)
  const mutation = useMutation({
    mutationFn: async () => {
      setProgress(0)
      const meta = await fetchModelMeta()
      const { data } = await api.get<ArrayBuffer>(
        '/ai/models/classifier/file',
        {
          responseType: 'arraybuffer',
          timeout: 5 * 60_000,
          onDownloadProgress: ({ loaded }) =>
            setProgress(Math.min(1, loaded / meta.size_bytes)),
        },
      )
      await saveModel({ meta, bytes: data })
      // Движок WebAssembly (14 МБ) — тоже заранее: Service Worker сохранит
      // его, и без сети анализ запустится
      await fetch(wasmBinary)
      return meta
    },
    onSuccess: (meta) => queryClient.setQueryData(storedKey, meta),
  })
  return { ...mutation, progress }
}

export function useDeleteModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteModel,
    // Удаление — только на устройстве: сеть для него не нужна
    networkMode: 'always',
    onSuccess: () => queryClient.setQueryData(storedKey, null),
  })
}

export function useOfflineDiagnose() {
  // По умолчанию TanStack Query без сети ставит мутации на паузу, а этой
  // сеть и не нужна: она работает именно тогда, когда сети нет
  return useMutation({
    mutationFn: (image: Blob) => classifyOffline(image),
    networkMode: 'always',
  })
}
