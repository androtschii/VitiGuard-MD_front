// Заметки с обхода, сделанные без сети: ждут в IndexedDB, пока сеть не появится
import { run } from './db'

export type QueuedNote = {
  id: number
  clientId: string
  vineyardId: string
  notedOn: string
  text: string
  latitude: number | null
  longitude: number | null
  // Байты, а не Blob: так запись переживает любую реализацию IndexedDB
  photo: ArrayBuffer | null
  photoName: string | null
  photoType: string | null
}

export type NewQueuedNote = Omit<QueuedNote, 'id'>

export function listQueuedNotes() {
  return run<QueuedNote[]>('notes', 'readonly', (store) => store.getAll())
}

export function enqueueNote(item: NewQueuedNote) {
  return run<IDBValidKey>('notes', 'readwrite', (store) => store.add(item))
}

export function removeQueuedNote(id: number) {
  return run<undefined>('notes', 'readwrite', (store) => store.delete(id))
}
