import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { deleteModel, loadModel, saveModel, type ModelMeta } from './modelStore'

const meta: ModelMeta = {
  name: 'efficientnet_b0',
  classes: ['healthy', 'esca'],
  image_size: 224,
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
  version: '3f1c9a0b7d2e4f60',
  size_bytes: 3,
}

describe('modelStore', () => {
  it('сохраняет, читает и удаляет модель', async () => {
    expect(await loadModel()).toBeNull()

    await saveModel({ meta, bytes: new Uint8Array([1, 2, 3]).buffer })
    const stored = await loadModel()

    expect(stored?.meta.version).toBe('3f1c9a0b7d2e4f60')
    expect(new Uint8Array(stored?.bytes ?? new ArrayBuffer(0))).toEqual(
      new Uint8Array([1, 2, 3]),
    )

    await deleteModel()
    expect(await loadModel()).toBeNull()
  })
})
