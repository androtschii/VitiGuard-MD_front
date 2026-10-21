// Записанные обходы на устройстве (pr-084): трек нужен и без сети, а на
// сервере для него пока нет места
import { run } from './db'
import type { Track } from './track'

export function listTracks() {
  return run<Track[]>('tracks', 'readonly', (store) => store.getAll())
}

export function saveTrack(track: Omit<Track, 'id'>) {
  return run<IDBValidKey>('tracks', 'readwrite', (store) => store.add(track))
}

export function deleteTrack(id: number) {
  return run<undefined>('tracks', 'readwrite', (store) => store.delete(id))
}
