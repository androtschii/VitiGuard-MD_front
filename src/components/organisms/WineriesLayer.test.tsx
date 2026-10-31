import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'maplibre-gl'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { WineriesLayer } from './WineriesLayer'

type Handler = (event?: {
  features?: { properties: object; geometry: object }[]
}) => void

function fakeMap() {
  const handlers: Record<string, Handler> = {}
  const canvas = { style: { cursor: '' } }
  const map = {
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    getCanvas: () => canvas,
    on: vi.fn((event: string, _: string, handler: Handler) => {
      handlers[event] = handler
    }),
    off: vi.fn(),
  }
  return { map, handlers, canvas }
}

function renderLayer(map: ReturnType<typeof fakeMap>['map']) {
  return render(
    <MapContext.Provider value={map as unknown as Map}>
      <WineriesLayer />
    </MapContext.Provider>,
  )
}

describe('WineriesLayer', () => {
  afterEach(() => {
    useMapStore.setState({ showWineries: false, wineRoute: [] })
  })

  it('выключенный слой карту не трогает', () => {
    const { map } = fakeMap()
    renderLayer(map)

    expect(map.addSource).not.toHaveBeenCalled()
  })

  it('по клику показывает карточку точной винодельни и закрывает её', async () => {
    useMapStore.setState({ showWineries: true })
    const { map, handlers, canvas } = fakeMap()
    renderLayer(map)
    expect(map.addSource).toHaveBeenCalledWith(
      'wineries',
      expect.objectContaining({ data: '/wineries.geojson' }),
    )

    handlers.mouseenter?.()
    expect(canvas.style.cursor).toBe('pointer')
    handlers.mouseleave?.()
    expect(canvas.style.cursor).toBe('')

    act(() =>
      handlers.click?.({
        features: [
          {
            properties: {
              name: 'Криково',
              kind: 'winery',
              city: 'Cricova',
              phone: '+37322',
              website: 'https://cricova.md',
            },
            geometry: { type: 'Point', coordinates: [28.8, 47.1] },
          },
        ],
      }),
    )

    const card = screen.getByRole('region', { name: 'Криково' })
    expect(card).toHaveTextContent('Винодельня · Cricova')
    expect(screen.getByRole('link', { name: 'Сайт' })).toHaveAttribute(
      'href',
      'https://cricova.md',
    )
    expect(screen.getByRole('link', { name: '+37322' })).toHaveAttribute(
      'href',
      'tel:+37322',
    )
    expect(screen.queryByText(/Точный адрес/)).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('честно помечает примерную точку, клик мимо ничего не открывает', () => {
    useMapStore.setState({ showWineries: true })
    const { map, handlers } = fakeMap()
    renderLayer(map)

    act(() => handlers.click?.({}))
    expect(screen.queryByRole('region')).toBeNull()

    act(() =>
      handlers.click?.({
        features: [
          {
            properties: { name: 'Novak', kind: 'shop', approximate: true },
            geometry: { type: 'Point', coordinates: [28.8, 47.1] },
          },
        ],
      }),
    )
    expect(screen.getByText(/Точный адрес/)).toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveTextContent('Магазин')
  })

  it('добавляет винодельню в маршрут один раз и не больше предела', async () => {
    useMapStore.setState({ showWineries: true })
    const { map, handlers } = fakeMap()
    renderLayer(map)
    const open = (name: string) =>
      act(() =>
        handlers.click?.({
          features: [
            {
              properties: { name, kind: 'winery' },
              geometry: { type: 'Point', coordinates: [28.8, 47.1] },
            },
          ],
        }),
      )

    open('Криково')
    await userEvent.click(screen.getByRole('button', { name: 'В маршрут' }))

    expect(useMapStore.getState().wineRoute).toEqual([
      { name: 'Криково', lat: 47.1, lon: 28.8 },
    ])
    expect(screen.getByRole('button', { name: 'В маршруте' })).toBeDisabled()
    useMapStore.getState().addRouteStop({ name: 'Криково', lat: 1, lon: 1 })
    expect(useMapStore.getState().wineRoute).toHaveLength(1)

    act(() =>
      useMapStore.setState({
        wineRoute: Array.from({ length: 8 }, (_, index) => ({
          name: String(index),
          lat: 47,
          lon: 28,
        })),
      }),
    )
    open('Новая')
    expect(screen.getByRole('button', { name: 'В маршрут' })).toBeDisabled()
    useMapStore.getState().addRouteStop({ name: 'Новая', lat: 1, lon: 1 })
    expect(useMapStore.getState().wineRoute).toHaveLength(8)
  })

  it('убирает слой при выключении и переживает удалённую карту', () => {
    useMapStore.setState({ showWineries: true })
    const { map } = fakeMap()
    map.removeLayer.mockImplementation(() => {
      throw new Error('нет карты')
    })
    renderLayer(map)

    act(() => useMapStore.setState({ showWineries: false }))

    expect(map.off).toHaveBeenCalledTimes(3)
  })
})
