import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, waitFor } from '@testing-library/react'
import type { Map } from 'maplibre-gl'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useMapStore } from '@/store/map'
import { corners, scan, vineyard } from '@/test/ndviData'
import { server } from '@/test/server'
import { MapContext } from '@/lib/mapContext'
import { NdviLayer } from './NdviLayer'

function fakeMap({ hasVineyards = true } = {}) {
  const added = new Set<string>()
  return {
    addSource: vi.fn(),
    addLayer: vi.fn<(layer: { id: string }, beforeId?: string) => void>(
      (layer) => {
        added.add(layer.id)
      },
    ),
    removeLayer: vi.fn((id: string) => {
      added.delete(id)
    }),
    removeSource: vi.fn(),
    getLayer: vi.fn((id: string) =>
      added.has(id) || (hasVineyards && !id.startsWith('ndvi-'))
        ? {}
        : undefined,
    ),
    setPaintProperty: vi.fn(),
  }
}

function useHistory(listed = vi.fn()) {
  const images = vi.fn<(scanId: string) => void>()
  server.use(
    http.get('/api/v1/vineyards', () => {
      listed()
      return HttpResponse.json({
        items: [vineyard('v1', 'Криково'), vineyard('v2', 'Пуркарь')],
        total: 2,
        page: 1,
        size: 100,
        pages: 1,
      })
    }),
    http.get('/api/v1/vineyards/:id/vegetation', ({ params }) =>
      HttpResponse.json(
        params.id === 'v1'
          ? [scan('june', '2026-06-25'), scan('cloudy', '2026-09-03', false)]
          : [scan('cloudy', '2026-09-03', false)],
      ),
    ),
    http.get(
      '/api/v1/vineyards/:id/vegetation/:scanId/ndvi.png',
      ({ params }) => {
        images(params.scanId as string)
        return HttpResponse.arrayBuffer(new Uint8Array([137, 80]).buffer, {
          headers: { 'Content-Type': 'image/png' },
        })
      },
    ),
  )
  return images
}

function renderLayer(map: ReturnType<typeof fakeMap> | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContext value={map as unknown as Map | null}>{children}</MapContext>
    </QueryClientProvider>
  )
  return render(<NdviLayer />, { wrapper })
}

describe('NdviLayer', () => {
  it('пока слой выключен, ничего не загружает', () => {
    const images = useHistory()
    const map = fakeMap()
    renderLayer(map)

    expect(map.addSource).not.toHaveBeenCalled()
    expect(images).not.toHaveBeenCalled()
  })

  it('кладёт картограмму последнего снимка под контур участка', async () => {
    useMapStore.setState({ showNdvi: true })
    const images = useHistory()
    const map = fakeMap()
    renderLayer(map)

    await waitFor(() => expect(map.addSource).toHaveBeenCalledTimes(1))
    expect(map.addSource).toHaveBeenCalledWith('ndvi-v1', {
      type: 'image',
      url: 'blob:leaf-photo',
      coordinates: corners,
    })
    const [layer, beforeId] = map.addLayer.mock.calls[0]
    expect(layer).toMatchObject({
      id: 'ndvi-v1',
      type: 'raster',
      paint: { 'raster-resampling': 'nearest' },
    })
    expect(beforeId).toBe('vineyards-outline')
    // У второго участка все снимки облачные — картинки нет
    expect(images.mock.calls).toEqual([['june']])
  })

  it('без слоя участков кладёт картограмму поверх подложки', async () => {
    useMapStore.setState({ showNdvi: true })
    useHistory()
    const map = fakeMap({ hasVineyards: false })
    renderLayer(map)

    await waitFor(() => expect(map.addLayer).toHaveBeenCalled())
    expect(map.addLayer.mock.calls[0][1]).toBeUndefined()
  })

  it('на выбранный день показывает снимок не позже него', async () => {
    useMapStore.setState({ showNdvi: true })
    const images = useHistory()
    server.use(
      http.get('/api/v1/vineyards/:id/vegetation', ({ params }) =>
        HttpResponse.json(
          params.id === 'v1'
            ? [scan('june', '2026-06-25'), scan('august', '2026-08-29')]
            : [],
        ),
      ),
    )
    const map = fakeMap()
    renderLayer(map)
    await waitFor(() => expect(images).toHaveBeenCalledWith('august'))

    act(() => useMapStore.setState({ ndviDay: '2026-07-31' }))

    await waitFor(() => expect(images).toHaveBeenCalledWith('june'))
    await waitFor(() => expect(map.addSource).toHaveBeenCalledTimes(2))
    expect(map.removeSource).toHaveBeenCalledWith('ndvi-v1')
  })

  it('меняет прозрачность, не загружая картинку заново', async () => {
    useMapStore.setState({ showNdvi: true, ndviOpacity: 0.5 })
    const images = useHistory()
    const map = fakeMap()
    renderLayer(map)
    await waitFor(() => expect(map.addLayer).toHaveBeenCalled())
    expect(map.addLayer.mock.calls[0][0]).toMatchObject({
      paint: { 'raster-opacity': 0.5 },
    })

    act(() => useMapStore.setState({ ndviOpacity: 0.2 }))

    expect(map.setPaintProperty).toHaveBeenLastCalledWith(
      'ndvi-v1',
      'raster-opacity',
      0.2,
    )
    expect(map.addLayer).toHaveBeenCalledTimes(1)
    expect(images).toHaveBeenCalledTimes(1)
  })

  it('при выключении убирает картограммы', async () => {
    useMapStore.setState({ showNdvi: true })
    useHistory()
    const map = fakeMap()
    renderLayer(map)
    await waitFor(() => expect(map.addLayer).toHaveBeenCalled())

    act(() => useMapStore.setState({ showNdvi: false }))

    expect(map.removeLayer).toHaveBeenCalledWith('ndvi-v1')
    expect(map.removeSource).toHaveBeenCalledWith('ndvi-v1')
  })

  it('участки вне фильтра без картограммы', async () => {
    useMapStore.setState({
      showNdvi: true,
      filter: { ...useMapStore.getState().filter, minArea: 5 },
    })
    const listed = vi.fn()
    const images = useHistory(listed)
    const map = fakeMap()
    renderLayer(map)

    await waitFor(() => expect(listed).toHaveBeenCalled())
    expect(images).not.toHaveBeenCalled()
    expect(map.addSource).not.toHaveBeenCalled()
  })

  it('не падает, если карту уже удалили', async () => {
    useMapStore.setState({ showNdvi: true })
    useHistory()
    const map = fakeMap()
    map.removeLayer.mockImplementation(() => {
      throw new Error('map removed')
    })
    const { unmount } = renderLayer(map)
    await waitFor(() => expect(map.addLayer).toHaveBeenCalled())

    expect(() => unmount()).not.toThrow()
  })

  it('без карты ничего не делает', () => {
    useMapStore.setState({ showNdvi: true })
    expect(() => renderLayer(null)).not.toThrow()
  })
})
