import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Track } from '@/lib/track'
import { deleteTrack, listTracks, saveTrack } from '@/lib/trackStore'

const tracksKey = ['tracks'] as const

// Треки лежат на устройстве: сеть не нужна ни для чтения, ни для записи
export function useTracks() {
  return useQuery({
    queryKey: tracksKey,
    queryFn: async () => (await listTracks()).reverse(),
    networkMode: 'always',
    staleTime: Infinity,
  })
}

export function useSaveTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (track: Omit<Track, 'id'>) => saveTrack(track),
    networkMode: 'always',
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tracksKey }),
  })
}

export function useDeleteTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTrack,
    networkMode: 'always',
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tracksKey }),
  })
}
