import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import type { MultiPolygon } from 'geojson'
import type { Map } from 'maplibre-gl'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { MapContext } from '@/lib/mapContext'
import { server } from '@/test/server'
import { VineyardsLayer } from './VineyardsLayer'

const geometry: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [28.86, 47.14],
        [28.862, 47.14],
        [28.862, 47.141],
        [28.86, 47.14],
      ],
    ],
  ],
}

const vineyard: Vineyard = {
  id: 'vineyard-1',
  name: 'Криково',
  geometry,
  created_at: '2026-10-12T10:00:00Z',
  updated_at: '2026-10-12T10:00:00Z',
}

function fakeMap() {
  const setData = vi.fn().mockResolvedValue(undefined)
  return {
    setData,
    map: {
      addSource: vi.fn(),
      addLayer: vi.fn<(layer: { id: string }) => void>(),
      removeLayer: vi.fn<(id: string) => void>(),
      removeSource: vi.fn(),
      fitBounds: vi.fn(),
      getSource: vi.fn(() => ({ setData })),
    },
  }
}

function serve(vineyards: Vineyard[]) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: vineyards,
        total: vineyards.length,
        page: 1,
        size: 100,
        pages: vineyards.length ? 1 : 0,
      }),
    ),
  )
}

function renderLayer(map: ReturnType<typeof fakeMap>['map'] | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContext value={map as unknown as Map | null}>{children}</MapContext>
    </QueryClientProvider>
  )
  return { ...render(<VineyardsLayer />, { wrapper }), queryClient }
}

describe('VineyardsLayer', () => {
  it('добавляет источник и слои заливки, контура и подписей', () => {
    const { map } = fakeMap()
    renderLayer(map)

    expect(map.addSource).toHaveBeenCalledWith(
      'vineyards',
      expect.objectContaining({ type: 'geojson' }),
    )
    expect(map.addLayer.mock.calls.map(([layer]) => layer.id)).toEqual([
      'vineyards-fill',
      'vineyards-outline',
      'vineyards-labels',
    ])
  })

  it('показывает участки и один раз приближает к ним карту', async () => {
    serve([vineyard])
    const { map, setData } = fakeMap()
    const { queryClient } = renderLayer(map)

    await waitFor(() =>
      expect(setData).toHaveBeenCalledWith({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 'vineyard-1', name: 'Криково' },
            geometry,
          },
        ],
      }),
    )
    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [28.86, 47.14],
        [28.862, 47.141],
      ],
      expect.objectContaining({ maxZoom: 15 }),
    )

    // Новый участок обновляет данные, но не сдвигает карту
    serve([vineyard, { ...vineyard, id: 'vineyard-2', name: 'Пуркарь' }])
    await queryClient.invalidateQueries()
    await waitFor(() => expect(setData).toHaveBeenCalledTimes(2))
    expect(map.fitBounds).toHaveBeenCalledOnce()
  })

  it('без участков карту не двигает', async () => {
    const { map, setData } = fakeMap()
    renderLayer(map)

    await waitFor(() => expect(setData).toHaveBeenCalled())
    expect(map.fitBounds).not.toHaveBeenCalled()
  })

  it('добавляет слои, когда карта загрузилась', async () => {
    serve([vineyard])
    const { map, setData } = fakeMap()
    const { rerender } = renderLayer(null)
    await waitFor(() => expect(map.addSource).not.toHaveBeenCalled())

    renderLayer(map)

    expect(map.addSource).toHaveBeenCalledOnce()
    await waitFor(() => expect(setData).toHaveBeenCalled())
    rerender(<VineyardsLayer />)
  })

  it('убирает слои и источник при уходе со страницы', () => {
    const { map } = fakeMap()
    const { unmount } = renderLayer(map)

    unmount()

    expect(map.removeLayer.mock.calls.map(([id]) => id)).toEqual([
      'vineyards-labels',
      'vineyards-outline',
      'vineyards-fill',
    ])
    expect(map.removeSource).toHaveBeenCalledWith('vineyards')
  })

  it('не падает, если карту уже удалили', () => {
    const { map } = fakeMap()
    map.removeLayer.mockImplementation(() => {
      throw new Error('map removed')
    })
    const { unmount } = renderLayer(map)

    expect(() => unmount()).not.toThrow()
  })
})
