import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'maplibre-gl'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { WineriesLayer } from './WineriesLayer'

type Handler = (event?: { features?: { properties: object }[] }) => void

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
    useMapStore.setState({ showWineries: false })
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
          },
        ],
      }),
    )
    expect(screen.getByText(/Точный адрес/)).toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveTextContent('Магазин')
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
