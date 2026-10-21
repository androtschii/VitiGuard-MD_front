// Проверки, сделанные без сети (pr-076): фото и выбранный участок ждут в
// IndexedDB, пока не появится сеть, и тогда уходят на сервер в историю
import type { Disease } from '@/api/diagnosis'
import { run } from './db'

export type QueuedDiagnosis = {
  id: number
  // Байты, а не Blob: так запись переживает любую реализацию IndexedDB
  image: ArrayBuffer
  name: string
  type: string
  vineyardId: string | null
  createdAt: string
  // Ответ модели на устройстве — чтобы было видно, что ждёт отправки
  disease: Disease
  confidence: number
}

export type NewQueuedDiagnosis = Omit<QueuedDiagnosis, 'id'>

export function listQueued() {
  return run<QueuedDiagnosis[]>('outbox', 'readonly', (store) => store.getAll())
}

export function enqueue(item: NewQueuedDiagnosis) {
  return run<IDBValidKey>('outbox', 'readwrite', (store) => store.add(item))
}

export function removeQueued(id: number) {
  return run<undefined>('outbox', 'readwrite', (store) => store.delete(id))
}
