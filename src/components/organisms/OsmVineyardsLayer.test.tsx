import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, waitFor } from '@testing-library/react'
import type { Map } from 'maplibre-gl'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { OsmVineyards } from '@/api/osm'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { server } from '@/test/server'
import { OsmVineyardsLayer } from './OsmVineyardsLayer'

const vineyards: OsmVineyards = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { osm_id: 'way/1', name: 'Cricova', area_ha: 12.5 },
      geometry: {
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
      },
    },
  ],
}

const EMPTY = { type: 'FeatureCollection', features: [] }

function fakeMap({ zoom = 13, hasVineyards = true } = {}) {
  const setData = vi.fn().mockResolvedValue(undefined)
  const handlers: Record<string, () => void> = {}
  const map = {
    addSource: vi.fn(),
    addLayer: vi.fn<(layer: { id: string }, beforeId?: string) => void>(),
    removeLayer: vi.fn<(id: string) => void>(),
    removeSource: vi.fn(),
    getLayer: vi.fn(() => (hasVineyards ? {} : undefined)),
    getZoom: vi.fn(() => zoom),
    getBounds: vi.fn(() => ({
      getWest: () => 28.851,
      getSouth: () => 47.131,
      getEast: () => 28.879,
      getNorth: () => 47.149,
    })),
    getSource: vi.fn(() => ({ setData })),
    once: vi.fn((event: string, handler: () => void) => {
      handlers[`once:${event}`] = handler
    }),
    on: vi.fn((event: string, handler: () => void) => {
      handlers[event] = handler
    }),
    off: vi.fn(),
  }
  const fire = (event: string) => act(() => handlers[event]())
  return { map, setData, fire }
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
  return render(<OsmVineyardsLayer />, { wrapper })
}

describe('OsmVineyardsLayer', () => {
  it('пока слой выключен, карту не трогает', () => {
    const { map } = fakeMap()
    renderLayer(map)

    expect(map.addSource).not.toHaveBeenCalled()
  })

  it('добавляет слои под участками пользователя', () => {
    useMapStore.setState({ showOsm: true })
    const { map } = fakeMap()
    renderLayer(map)

    expect(map.addSource).toHaveBeenCalledWith(
      'osm-vineyards',
      expect.objectContaining({ type: 'geojson' }),
    )
    expect(map.addLayer.mock.calls).toEqual([
      [expect.objectContaining({ id: 'osm-vineyards-fill' }), 'vineyards-fill'],
      [
        expect.objectContaining({ id: 'osm-vineyards-outline' }),
        'vineyards-fill',
      ],
    ])
  })

  it('без слоя участков добавляет слои поверх подложки', () => {
    useMapStore.setState({ showOsm: true })
    const { map } = fakeMap({ hasVineyards: false })
    renderLayer(map)

    expect(map.addLayer.mock.calls.map(([, beforeId]) => beforeId)).toEqual([
      undefined,
      undefined,
    ])
  })

  it('загружает виноградники окна карты, когда карта отрисована', async () => {
    useMapStore.setState({ showOsm: true })
    let bbox: string | null = null
    server.use(
      http.get('/api/v1/osm/vineyards', ({ request }) => {
        bbox = new URL(request.url).searchParams.get('bbox')
        return HttpResponse.json(vineyards)
      }),
    )
    const { map, setData, fire } = fakeMap()
    renderLayer(map)

    fire('once:idle')

    await waitFor(() => expect(setData).toHaveBeenCalledWith(vineyards))
    expect(bbox).toBe('28.85,47.13,28.88,47.15')
    expect(useMapStore.getState().osmTooFar).toBe(false)
  })

  it('на мелком масштабе не загружает и просит приблизить', async () => {
    useMapStore.setState({ showOsm: true })
    const request = vi.fn()
    server.use(
      http.get('/api/v1/osm/vineyards', () => {
        request()
        return HttpResponse.json(vineyards)
      }),
    )
    const { map, setData, fire } = fakeMap({ zoom: 9 })
    renderLayer(map)

    fire('moveend')

    expect(useMapStore.getState().osmTooFar).toBe(true)
    await waitFor(() => expect(setData).toHaveBeenLastCalledWith(EMPTY))
    expect(request).not.toHaveBeenCalled()
  })

  it('при выключении убирает слои и сбрасывает подсказку', () => {
    useMapStore.setState({ showOsm: true })
    const { map, fire } = fakeMap({ zoom: 9 })
    renderLayer(map)
    fire('moveend')

    act(() => useMapStore.setState({ showOsm: false }))

    expect(map.off).toHaveBeenCalledWith('moveend', expect.any(Function))
    expect(map.removeLayer.mock.calls.map(([id]) => id)).toEqual([
      'osm-vineyards-outline',
      'osm-vineyards-fill',
    ])
    expect(map.removeSource).toHaveBeenCalledWith('osm-vineyards')
    expect(useMapStore.getState().osmTooFar).toBe(false)
  })

  it('не падает, если карту уже удалили', () => {
    useMapStore.setState({ showOsm: true })
    const { map } = fakeMap()
    map.removeLayer.mockImplementation(() => {
      throw new Error('map removed')
    })
    const { unmount } = renderLayer(map)

    expect(() => unmount()).not.toThrow()
  })

  it('без карты ничего не делает', () => {
    useMapStore.setState({ showOsm: true })
    expect(() => renderLayer(null)).not.toThrow()
  })
})
