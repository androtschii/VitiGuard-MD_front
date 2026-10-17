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
  area_ha: 1.69,
  variety: null,
  planting_year: null,
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
      getContainer: vi.fn(() => ({ clientWidth: 1000 })),
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
            properties: { id: 'vineyard-1', name: 'Криково', risk: 'none' },
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
      expect.objectContaining({
        maxZoom: 15,
        padding: { top: 48, right: 48, bottom: 48, left: 290 },
      }),
    )

    // Новый участок обновляет данные, но не сдвигает карту
    serve([vineyard, { ...vineyard, id: 'vineyard-2', name: 'Пуркарь' }])
    await queryClient.invalidateQueries()
    await waitFor(() => expect(setData).toHaveBeenCalledTimes(2))
    expect(map.fitBounds).toHaveBeenCalledOnce()
  })

  it('красит участок по худшему риску на сегодня', async () => {
    serve([vineyard, { ...vineyard, id: 'vineyard-2', name: 'Пуркарь' }])
    server.use(
      http.get('/api/v1/risks/today', () =>
        HttpResponse.json([
          {
            vineyard_id: 'vineyard-1',
            day: '2026-06-10',
            downy: 'low',
            powdery: 'medium',
          },
        ]),
      ),
    )
    const { map, setData } = fakeMap()
    renderLayer(map)

    await waitFor(() =>
      expect(setData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          features: [
            expect.objectContaining({
              properties: { id: 'vineyard-1', name: 'Криково', risk: 'medium' },
            }),
            expect.objectContaining({
              properties: { id: 'vineyard-2', name: 'Пуркарь', risk: 'none' },
            }),
          ],
        }),
      ),
    )
    const fill = map.addLayer.mock.calls[0][0] as unknown as {
      paint: { 'fill-color': unknown[] }
    }
    expect(fill.paint['fill-color'].slice(0, 2)).toEqual([
      'match',
      ['get', 'risk'],
    ])
  })

  it('на узкой карте не оставляет места под панель', async () => {
    serve([vineyard])
    const { map, setData } = fakeMap()
    map.getContainer.mockReturnValue({ clientWidth: 400 })
    renderLayer(map)

    await waitFor(() => expect(setData).toHaveBeenCalled())
    expect(map.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        padding: { top: 48, right: 48, bottom: 48, left: 48 },
      }),
    )
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
