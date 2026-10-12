import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map } from 'maplibre-gl'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { MeasureControl } from './MeasureControl'

type FakeMap = {
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  addLayer: ReturnType<typeof vi.fn>
  removeSource: ReturnType<typeof vi.fn>
  getSource: ReturnType<typeof vi.fn>
  canvas: { style: { cursor: string } }
  doubleClickZoom: {
    disable: ReturnType<typeof vi.fn>
    enable: ReturnType<typeof vi.fn>
  }
}

function setup(map: FakeMap | null = new Map({} as never) as never) {
  const setData = vi.fn().mockResolvedValue(undefined)
  map?.getSource.mockReturnValue({ setData })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext value={map as never}>{children}</MapContext>
  )
  const view = render(<MeasureControl />, { wrapper })
  const clickAt = (lng: number, lat: number) => {
    const onClick = map?.on.mock.calls.findLast(
      ([event]) => event === 'click',
    )?.[1] as (event: unknown) => void
    act(() => onClick({ lngLat: { lng, lat } }))
  }
  return { map, view, setData, clickAt }
}

const start = () =>
  userEvent.click(
    screen.getByRole('button', { name: 'Измерить расстояние и площадь' }),
  )

describe('MeasureControl', () => {
  it('пока карта не загружена, ничего не показывает', () => {
    const { view } = setup(null)

    expect(view.container).toBeEmptyDOMElement()
  })

  it('включает линейку: слои, курсор-прицел, без приближения двойным кликом', async () => {
    const { map } = setup()

    await start()

    expect(map?.addLayer).toHaveBeenCalledTimes(3)
    expect(map?.doubleClickZoom.disable).toHaveBeenCalled()
    expect(map?.canvas.style.cursor).toBe('crosshair')
    expect(useMapStore.getState().isDrawing).toBe(true)
    expect(screen.getByText('Расстояние: 0 м')).toBeInTheDocument()
  })

  it('считает расстояние, а с трёх точек и площадь', async () => {
    const { clickAt, setData } = setup()
    await start()

    clickAt(28.8, 47)
    clickAt(28.8, 47.005)
    expect(screen.getByText('Расстояние: 556 м')).toBeInTheDocument()
    expect(screen.queryByText(/Площадь/)).not.toBeInTheDocument()

    clickAt(28.81, 47.005)
    expect(screen.getByText('Расстояние: 1,31 км')).toBeInTheDocument()
    // Разряды разделяет неразрывный пробел (какой именно — зависит от ICU)
    expect(
      screen.getByText(/^Площадь: 21,08 га \(210\s802 м²\)$/),
    ).toBeInTheDocument()
    expect(setData).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'FeatureCollection' }),
    )
  })

  it('убирает последнюю точку', async () => {
    const { clickAt } = setup()
    await start()
    clickAt(28.8, 47)
    clickAt(28.8, 47.005)

    await userEvent.click(screen.getByRole('button', { name: 'Убрать точку' }))

    expect(screen.getByText('Расстояние: 0 м')).toBeInTheDocument()
  })

  it.each([
    [
      'кнопкой «Готово»',
      () => userEvent.click(screen.getByRole('button', { name: 'Готово' })),
    ],
    [
      'клавишей Esc',
      async () => {
        fireEvent.keyDown(document, { key: 'Escape' })
        await Promise.resolve()
      },
    ],
  ])('выключается %s и возвращает карту в обычный режим', async (_, finish) => {
    const { map } = setup()
    await start()

    await act(finish)

    expect(map?.off).toHaveBeenCalledWith('click', expect.any(Function))
    expect(map?.doubleClickZoom.enable).toHaveBeenCalled()
    expect(map?.removeSource).toHaveBeenCalledWith('measure')
    expect(map?.canvas.style.cursor).toBe('')
    expect(useMapStore.getState().isDrawing).toBe(false)
    expect(
      screen.getByRole('button', { name: 'Измерить расстояние и площадь' }),
    ).toBeInTheDocument()
  })

  it('недоступна, пока рисуется контур участка', () => {
    useMapStore.setState({ isDrawing: true })
    setup()

    expect(
      screen.getByRole('button', { name: 'Измерить расстояние и площадь' }),
    ).toBeDisabled()
  })

  it('не падает, если карту уже удалили', async () => {
    const { map, view } = setup()
    await start()
    map?.removeSource.mockImplementation(() => {
      throw new Error('map removed')
    })

    expect(() => view.unmount()).not.toThrow()
  })
})
