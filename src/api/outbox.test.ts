import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './client'
import { enqueue, listQueued, removeQueued } from '@/lib/outbox'
import { queuedLeaf } from '@/test/outboxData'
import { diagnosis } from '@/test/handlers'
import { server } from '@/test/server'
import { sendQueued } from './outbox'

afterEach(async () => {
  for (const item of await listQueued()) await removeQueued(item.id)
})

describe('sendQueued', () => {
  it('сохраняет фото в историю на выбранном участке', async () => {
    const post = vi.spyOn(api, 'post')
    const requests: URLSearchParams[] = []
    server.use(
      http.post('/api/v1/ai/diagnose', ({ request }) => {
        requests.push(new URL(request.url).searchParams)
        return HttpResponse.json({ ...diagnosis, id: 'saved-1' })
      }),
    )
    await enqueue(queuedLeaf)
    await enqueue({ ...queuedLeaf, vineyardId: null })

    const result = await sendQueued(await listQueued())

    expect(result).toEqual({ sent: 2, rejected: 0 })
    expect(requests[0]?.get('save')).toBe('true')
    expect(requests[0]?.get('vineyard_id')).toBe('plot-1')
    expect(requests[1]?.has('vineyard_id')).toBe(false)
    const image = (post.mock.calls[0]?.[1] as FormData).get('image') as File
    expect(image.name).toBe('leaf.jpg')
    expect(image.type).toBe('image/jpeg')
    expect(await image.text()).toBe('leaf')
    expect(await listQueued()).toEqual([])
  })

  it('отвергнутое сервером фото убирает, при сбое остальные ждут', async () => {
    let calls = 0
    server.use(
      http.post('/api/v1/ai/diagnose', () => {
        calls += 1
        if (calls === 1)
          return HttpResponse.json({ detail: 'Не фото' }, { status: 415 })
        return HttpResponse.json({ detail: 'Сбой' }, { status: 503 })
      }),
    )
    await enqueue({ ...queuedLeaf, name: 'bad.gif' })
    await enqueue(queuedLeaf)

    await expect(sendQueued(await listQueued())).rejects.toThrow()

    expect((await listQueued()).map((item) => item.name)).toEqual(['leaf.jpg'])
  })
})
