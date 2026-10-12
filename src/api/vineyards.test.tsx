import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { Polygon } from 'geojson'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/server'
import {
  toMultiPolygon,
  updateVineyard,
  useCreateVineyard,
  useUpdateVineyard,
  vineyardKeys,
} from './vineyards'

const polygon: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [28.86, 47.14],
      [28.862, 47.14],
      [28.862, 47.141],
      [28.86, 47.14],
    ],
  ],
}

function setup() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { wrapper, invalidate }
}

describe('API участков', () => {
  it('контур с карты становится MultiPolygon из одной части', () => {
    expect(toMultiPolygon(polygon)).toEqual({
      type: 'MultiPolygon',
      coordinates: [polygon.coordinates],
    })
  })

  it('создаёт участок и обновляет список участков', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useCreateVineyard(), { wrapper })

    const vineyard = await result.current.mutateAsync({
      name: 'Криково',
      geometry: toMultiPolygon(polygon),
    })

    expect(vineyard).toMatchObject({ id: 'vineyard-1', name: 'Криково' })
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: vineyardKeys.all }),
    )
  })

  it('изменяет участок по id', async () => {
    let received: unknown
    server.use(
      http.patch('/api/v1/vineyards/:id', async ({ params, request }) => {
        received = { id: params.id, body: await request.json() }
        return HttpResponse.json({ id: params.id, name: 'Новое имя' })
      }),
    )
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateVineyard('vineyard-7'), {
      wrapper,
    })

    await result.current.mutateAsync({ name: 'Новое имя' })

    expect(received).toEqual({
      id: 'vineyard-7',
      body: { name: 'Новое имя' },
    })
    await waitFor(() => expect(invalidate).toHaveBeenCalled())
  })

  it('передаёт ошибку сервера', async () => {
    server.use(
      http.patch('/api/v1/vineyards/:id', () =>
        HttpResponse.json({ detail: 'Участок не найден' }, { status: 404 }),
      ),
    )

    await expect(updateVineyard('missing', { name: 'x' })).rejects.toThrow(
      'Участок не найден',
    )
  })
})
