import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkerRequest } from './offlineClassifier'

type Listener = ((event: { data: unknown }) => void) | null

// Поток вместо настоящего: отвечает на запросы так, как велит тест
class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: Listener = null
  onerror:
    ((event: { message: string; preventDefault: () => void }) => void) | null =
    null
  posted: WorkerRequest[] = []
  terminate = vi.fn()

  constructor() {
    FakeWorker.instances.push(this)
  }

  postMessage(message: WorkerRequest) {
    this.posted.push(message)
  }

  reply(data: unknown) {
    this.onmessage?.({ data })
  }
}

async function load() {
  vi.resetModules()
  FakeWorker.instances = []
  vi.stubGlobal('Worker', FakeWorker)
  return import('./offlineClassifier')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('offlineClassifier', () => {
  it('переводит ответ потока в диагноз, как у сервера', async () => {
    const { classifyOffline } = await load()
    const image = new Blob(['leaf'])

    const result = classifyOffline(image)
    const worker = FakeWorker.instances[0]
    expect(worker?.posted).toEqual([{ id: 1, image }])
    // Ответ на чужой запрос пропускается
    worker?.reply({ id: 99, ok: true, model: 'x', ranked: [] })
    worker?.reply({
      id: 1,
      ok: true,
      model: 'efficientnet_b0',
      ranked: [
        { disease: 'black_rot', probability: 0.55 },
        { disease: 'esca', probability: 0.45 },
      ],
    })

    await expect(result).resolves.toEqual({
      model: 'efficientnet_b0',
      disease: 'black_rot',
      confidence: 0.55,
      low_confidence: true,
      top: [
        { disease: 'black_rot', probability: 0.55 },
        { disease: 'esca', probability: 0.45 },
      ],
      heatmap: null,
      lesion: null,
    })
  })

  it('один поток на все запросы и ошибка модели — отказ', async () => {
    const { classifyOffline } = await load()

    const first = classifyOffline(new Blob(['a']))
    const second = classifyOffline(new Blob(['b']))
    const worker = FakeWorker.instances[0]
    worker?.reply({ id: 2, ok: false, error: 'model-missing' })
    worker?.reply({ id: 1, ok: true, model: 'm', ranked: [] })

    expect(FakeWorker.instances).toHaveLength(1)
    await expect(second).rejects.toThrow('model-missing')
    // Пустой ответ — на всякий случай «здоровый» с нулевой уверенностью
    await expect(first).resolves.toMatchObject({
      disease: 'healthy',
      confidence: 0,
      low_confidence: true,
    })
  })

  it('поток не загрузился: ждущие запросы получают ошибку', async () => {
    const { classifyOffline } = await load()

    const result = classifyOffline(new Blob(['a']))
    const worker = FakeWorker.instances[0]
    const preventDefault = vi.fn()
    worker?.onerror?.({ message: '', preventDefault })

    await expect(result).rejects.toThrow('worker')
    expect(preventDefault).toHaveBeenCalled()
    expect(worker?.terminate).toHaveBeenCalled()

    // Следующий запрос создаёт поток заново
    void classifyOffline(new Blob(['b'])).catch(() => {})
    expect(FakeWorker.instances).toHaveLength(2)
    FakeWorker.instances[1]?.onerror?.({
      message: 'load failed',
      preventDefault,
    })
  })
})
