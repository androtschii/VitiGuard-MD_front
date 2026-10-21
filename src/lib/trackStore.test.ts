import { describe, expect, it } from 'vitest'
import { deleteTrack, listTracks, saveTrack } from './trackStore'

describe('trackStore', () => {
  it('сохраняет, перечисляет и удаляет треки', async () => {
    await saveTrack({
      startedAt: '2026-06-10T07:00:00.000Z',
      points: [{ lng: 28.86, lat: 47.14, accuracy: 5, time: 0 }],
    })

    const [track] = await listTracks()
    expect(track?.points).toHaveLength(1)

    await deleteTrack(track?.id ?? 0)
    expect(await listTracks()).toEqual([])
  })
})
