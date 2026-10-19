import type { Diagnosis, Disease } from '@/api/diagnosis'
import type { RankedClass } from '@/lib/leafTensor'

export type WorkerRequest = { id: number; image: Blob }
export type WorkerResponse =
  | { id: number; ok: true; model: string; ranked: RankedClass[] }
  | { id: number; ok: false; error: string }

// Порог уверенности — как у сервера (app/services/diagnosis.py)
const LOW_CONFIDENCE = 0.6

// Ответ классификатора на устройстве в том же виде, что ответ сервера.
// Тепловой карты и маски поражения нет: их модели в браузер не скачиваются
export function toDiagnosis(model: string, ranked: RankedClass[]): Diagnosis {
  const top = ranked.map(({ disease, probability }) => ({
    disease: disease as Disease,
    probability,
  }))
  const best = top[0] ?? { disease: 'healthy', probability: 0 }
  return {
    model,
    disease: best.disease,
    confidence: best.probability,
    low_confidence: best.probability < LOW_CONFIDENCE,
    top,
    heatmap: null,
    lesion: null,
  }
}

let worker: Worker | null = null
let nextId = 0
const pending = new Map<
  number,
  { resolve: (value: Diagnosis) => void; reject: (reason: Error) => void }
>()

function getWorker() {
  if (worker) return worker
  worker = new Worker(
    new URL('../workers/classifier.worker.ts', import.meta.url),
    { type: 'module' },
  )
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data
    const request = pending.get(response.id)
    if (!request) return
    pending.delete(response.id)
    if (response.ok)
      request.resolve(toDiagnosis(response.model, response.ranked))
    else request.reject(new Error(response.error))
  }
  // Поток не загрузился (например, нет файла без сети): ждущие запросы
  // получают ошибку, а не висят, и следующий запрос создаст поток заново
  worker.onerror = (event) => {
    event.preventDefault()
    for (const request of pending.values()) {
      request.reject(new Error(event.message || 'worker'))
    }
    pending.clear()
    worker?.terminate()
    worker = null
  }
  return worker
}

// Диагноз по фото на устройстве, без сети (pr-074)
export function classifyOffline(image: Blob) {
  const id = ++nextId
  return new Promise<Diagnosis>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, image } satisfies WorkerRequest)
  })
}
