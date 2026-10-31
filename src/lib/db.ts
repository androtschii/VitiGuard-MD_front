// Одна база IndexedDB приложения: скачанная модель (pr-072), очередь
// проверок, сделанных без сети (pr-076), треки обходов (pr-084) и заметки с обхода. Новое
// хранилище — новая версия базы

const NAME = 'vitiguard'
const VERSION = 4

export type StoreName = 'models' | 'outbox' | 'tracks' | 'notes'

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(NAME, VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('models'))
        db.createObjectStore('models')
      if (!db.objectStoreNames.contains('outbox'))
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true })
      if (!db.objectStoreNames.contains('tracks'))
        db.createObjectStore('tracks', { keyPath: 'id', autoIncrement: true })
      if (!db.objectStoreNames.contains('notes'))
        db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
  })
}

export async function run<T>(
  name: StoreName,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest,
) {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(name, mode).objectStore(name))
      request.onsuccess = () => resolve(request.result as T)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
    })
  } finally {
    db.close()
  }
}
