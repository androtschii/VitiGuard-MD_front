import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  enqueue,
  listQueued,
  removeQueued,
  type QueuedDiagnosis,
} from '@/lib/outbox'
import { ApiError } from './client'
import { diagnoseLeaf, type Diagnosis } from './diagnosis'

const outboxKey = ['outbox'] as const

// Очередь живёт на устройстве: ни чтение, ни запись сети не ждут
export function useOutbox() {
  return useQuery({
    queryKey: outboxKey,
    queryFn: listQueued,
    networkMode: 'always',
    staleTime: Infinity,
  })
}

export type QueueInput = {
  image: File
  vineyardId: string
  result: Diagnosis
}

export function useQueueDiagnosis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ image, vineyardId, result }: QueueInput) =>
      enqueue({
        image: await image.arrayBuffer(),
        name: image.name,
        type: image.type,
        vineyardId: vineyardId || null,
        createdAt: new Date().toISOString(),
        disease: result.disease,
        confidence: result.confidence,
      }),
    networkMode: 'always',
    onSuccess: () => queryClient.invalidateQueries({ queryKey: outboxKey }),
  })
}

export type SyncResult = { sent: number; rejected: number }

// Сервер отверг само фото (не тот формат, слишком большое): повтор не поможет.
// Сбой сети, ошибка сервера и истёкший вход — повод повторить позже
function isRejected(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status !== null &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 401
  )
}

// По одной, по порядку съёмки: при сбое отправленные уже убраны из очереди,
// остальные ждут следующей попытки
export async function sendQueued(items: QueuedDiagnosis[]) {
  const result: SyncResult = { sent: 0, rejected: 0 }
  for (const item of items) {
    try {
      await diagnoseLeaf({
        image: new File([item.image], item.name, { type: item.type }),
        save: true,
        vineyardId: item.vineyardId,
      })
      result.sent += 1
    } catch (error) {
      if (!isRejected(error)) throw error
      result.rejected += 1
    }
    await removeQueued(item.id)
  }
  return result
}

export function useSyncOutbox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => sendQueued(await listQueued()),
    // И при сбое: часть проверок могла уйти до него
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: outboxKey }),
        queryClient.invalidateQueries({ queryKey: ['diagnoses'] }),
      ]),
  })
}
