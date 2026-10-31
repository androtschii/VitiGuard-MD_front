import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  enqueueNote,
  listQueuedNotes,
  removeQueuedNote,
  type NewQueuedNote,
  type QueuedNote,
} from '@/lib/noteOutbox'
import { api, ApiError } from './client'

export type FieldNote = {
  id: string
  vineyard_id: string
  noted_on: string
  text: string
  latitude: number | null
  longitude: number | null
  has_photo: boolean
  created_at: string
  updated_at: string
}

export type FieldNoteInput = {
  notedOn: string
  text: string
  latitude: number | null
  longitude: number | null
  photo: File | null
}

const notesKey = (id: string) => ['vineyards', id, 'notes'] as const
const queuedKey = ['notes-queue'] as const

export function useFieldNotes(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: notesKey(vineyardId),
    queryFn: async () => {
      const { data } = await api.get<FieldNote[]>(
        `/vineyards/${vineyardId}/notes`,
      )
      return data
    },
    staleTime: 5 * 60_000,
    enabled,
  })
}

// Очередь живёт на устройстве: ни чтение, ни запись сети не ждут
export function useQueuedNotes() {
  return useQuery({
    queryKey: queuedKey,
    queryFn: listQueuedNotes,
    networkMode: 'always',
    staleTime: Infinity,
  })
}

async function sendNote(item: NewQueuedNote) {
  const form = new FormData()
  form.append('noted_on', item.notedOn)
  form.append('text', item.text)
  form.append('client_id', item.clientId)
  if (item.latitude !== null && item.longitude !== null) {
    form.append('latitude', String(item.latitude))
    form.append('longitude', String(item.longitude))
  }
  if (item.photo) {
    form.append(
      'photo',
      new File([item.photo], item.photoName ?? 'note.jpg', {
        type: item.photoType ?? 'image/jpeg',
      }),
    )
  }
  await api.post(`/vineyards/${item.vineyardId}/notes`, form, {
    timeout: 60_000,
  })
}

// Запроса не было вовсе: сети нет или сервер не ответил
const isOffline = (error: unknown) =>
  error instanceof ApiError && error.status === null

export function useCreateFieldNote(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ photo, ...input }: FieldNoteInput) => {
      const item: NewQueuedNote = {
        ...input,
        vineyardId,
        clientId: crypto.randomUUID(),
        photo: photo ? await photo.arrayBuffer() : null,
        photoName: photo?.name ?? null,
        photoType: photo?.type ?? null,
      }
      try {
        if (!navigator.onLine) throw new ApiError('offline', null)
        await sendNote(item)
      } catch (error) {
        if (!isOffline(error)) throw error
        await enqueueNote(item)
      }
    },
    networkMode: 'always',
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: notesKey(vineyardId) }),
        queryClient.invalidateQueries({ queryKey: queuedKey }),
      ]),
  })
}

export function useDeleteFieldNote(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/vineyards/${vineyardId}/notes/${noteId}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notesKey(vineyardId) }),
  })
}

export function useDeleteQueuedNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeQueuedNote,
    networkMode: 'always',
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queuedKey }),
  })
}

export function useNotePhoto(vineyardId: string, noteId: string) {
  return useQuery({
    queryKey: [...notesKey(vineyardId), noteId, 'photo'],
    queryFn: async () => {
      const { data } = await api.get<Blob>(
        `/vineyards/${vineyardId}/notes/${noteId}/photo`,
        { responseType: 'blob' },
      )
      return data
    },
    staleTime: Infinity,
  })
}

// Сервер отверг саму заметку: повтор не поможет. Сбой сети, ошибка сервера и
// истёкший вход — повод повторить позже
function isRejected(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status !== null &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 401
  )
}

export async function sendQueuedNotes(items: QueuedNote[]) {
  const result = { sent: 0, rejected: 0 }
  for (const { id, ...item } of items) {
    try {
      await sendNote(item)
      result.sent += 1
    } catch (error) {
      if (!isRejected(error)) throw error
      result.rejected += 1
    }
    await removeQueuedNote(id)
  }
  return result
}

export function useSyncNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => sendQueuedNotes(await listQueuedNotes()),
    // И при сбое: часть заметок могла уйти до него
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queuedKey }),
        queryClient.invalidateQueries({ queryKey: ['vineyards'] }),
      ]),
  })
}
