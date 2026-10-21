// Скачанный классификатор в IndexedDB (pr-072): 16 МБ не помещаются в
// localStorage, а кэш Service Worker не даёт узнать версию сохранённой копии
import { run } from './db'

export type ModelMeta = {
  name: string
  classes: string[]
  image_size: number
  mean: number[]
  std: number[]
  version: string
  size_bytes: number
}

export type StoredModel = { meta: ModelMeta; bytes: ArrayBuffer }

const KEY = 'classifier'

export async function loadModel() {
  return (
    (await run<StoredModel | undefined>('models', 'readonly', (store) =>
      store.get(KEY),
    )) ?? null
  )
}

export function saveModel(model: StoredModel) {
  return run<IDBValidKey>('models', 'readwrite', (store) =>
    store.put(model, KEY),
  )
}

export function deleteModel() {
  return run<undefined>('models', 'readwrite', (store) => store.delete(KEY))
}
