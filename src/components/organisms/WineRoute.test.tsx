import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'maplibre-gl'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { WineRouteLine, WineRoutePanel } from './WineRoute'

const a = { name: 'Криково', lat: 47.14, lon: 28.86 }
const b = { name: 'Пуркарь', lat: 46.53, lon: 29.87 }

function fakeMap() {
  const setData = vi.fn()
  return {
    setData,
    map: {
      addSource: vi.fn(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
      getSource: vi.fn(() => ({ setData })),
    },
  }
}

const renderLine = (map: ReturnType<typeof fakeMap>['map']) =>
  render(
    <MapContext.Provider value={map as unknown as Map}>
      <WineRouteLine />
    </MapContext.Provider>,
  )

describe('маршрут виноделен', () => {
  afterEach(() => {
    useMapStore.setState({ wineRoute: [] })
  })

  it('пустой маршрут ничего не показывает', () => {
    render(<WineRoutePanel />)

    expect(screen.queryByRole('region')).toBeNull()
  })

  it('одна точка просит добавить ещё', () => {
    useMapStore.setState({ wineRoute: [a] })
    render(<WineRoutePanel />)

    expect(screen.getByText(/Добавьте ещё/)).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('показывает длину, ссылку, убирает точку и очищает маршрут', async () => {
    useMapStore.setState({ wineRoute: [a, b] })
    render(<WineRoutePanel />)

    expect(screen.getByText(/км по прямой/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Открыть в навигаторе' }),
    ).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/47.14,28.86/46.53,29.87',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Убрать Пуркарь/ }),
    )
    expect(useMapStore.getState().wineRoute).toEqual([a])

    await userEvent.click(
      screen.getByRole('button', { name: 'Очистить маршрут' }),
    )
    expect(useMapStore.getState().wineRoute).toEqual([])
  })

  it('линия появляется от двух точек и убирается вместе с ними', () => {
    const { map, setData } = fakeMap()
    useMapStore.setState({ wineRoute: [a] })
    renderLine(map)
    expect(map.addLayer).not.toHaveBeenCalled()

    act(() => useMapStore.setState({ wineRoute: [a, b] }))
    expect(map.addLayer).toHaveBeenCalledOnce()
    expect(setData).toHaveBeenCalledWith(
      expect.objectContaining({
        geometry: {
          type: 'LineString',
          coordinates: [
            [28.86, 47.14],
            [29.87, 46.53],
          ],
        },
      }),
    )

    act(() => useMapStore.setState({ wineRoute: [] }))
    expect(map.removeLayer).toHaveBeenCalledWith('wine-route-line')
  })

  it('переживает удалённую карту', () => {
    const { map } = fakeMap()
    map.removeLayer.mockImplementation(() => {
      throw new Error('нет карты')
    })
    useMapStore.setState({ wineRoute: [a, b] })
    const { unmount } = renderLine(map)

    expect(unmount).not.toThrow()
  })
})
