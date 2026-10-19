// Скачанный классификатор в IndexedDB (pr-072): 16 МБ не помещаются в
// localStorage, а кэш Service Worker не даёт узнать версию сохранённой копии

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

const DB = 'vitiguard'
const STORE = 'models'
const KEY = 'classifier'

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
  })
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest,
) {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result as T)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
    })
  } finally {
    db.close()
  }
}

export async function loadModel() {
  return (
    (await run<StoredModel | undefined>('readonly', (store) =>
      store.get(KEY),
    )) ?? null
  )
}

export function saveModel(model: StoredModel) {
  return run<IDBValidKey>('readwrite', (store) => store.put(model, KEY))
}

export function deleteModel() {
  return run<undefined>('readwrite', (store) => store.delete(KEY))
}
