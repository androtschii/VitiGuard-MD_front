import { afterEach, describe, expect, it } from 'vitest'
import { loadModel } from './modelStore'
import { queuedLeaf } from '@/test/outboxData'
import { enqueue, listQueued, removeQueued } from './outbox'

function deleteDatabase() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('vitiguard')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
  })
}

afterEach(deleteDatabase)

describe('outbox', () => {
  it('хранит проверки по порядку и убирает отправленные', async () => {
    await enqueue(queuedLeaf)
    await enqueue({ ...queuedLeaf, name: 'second.jpg', vineyardId: null })

    const [first, second] = await listQueued()

    expect(first?.name).toBe('leaf.jpg')
    expect(second?.name).toBe('second.jpg')
    expect(new TextDecoder().decode(first?.image)).toBe('leaf')

    await removeQueued(first?.id ?? 0)
    expect((await listQueued()).map((item) => item.name)).toEqual([
      'second.jpg',
    ])
  })

  it('база первой версии получает очередь и сохраняет скачанную модель', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('vitiguard', 1)
      request.onupgradeneeded = () => {
        request.result
          .createObjectStore('models')
          .put(
            { meta: { version: 'v1' }, bytes: new ArrayBuffer(1) },
            'classifier',
          )
      }
      request.onsuccess = () => {
        request.result.close()
        resolve()
      }
      request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
    })

    await enqueue(queuedLeaf)

    expect(await listQueued()).toHaveLength(1)
    expect((await loadModel())?.meta.version).toBe('v1')
  })
})
