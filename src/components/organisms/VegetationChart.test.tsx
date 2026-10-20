import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { VegetationObservation } from '@/api/vegetation'
import * as timeSeriesChart from '@/lib/timeSeriesChart'
import { VegetationChart } from './VegetationChart'

const index = (mean: number) => ({ mean, min: mean, max: mean, std: 0 })

const observations: VegetationObservation[] = [
  ['2026-03-07', 0.31, 0.22],
  ['2026-05-28', null, null],
  ['2026-06-25', 0.79, 0.45],
  ['2026-10-11', 0.41, 0.24],
].map(([date, ndvi, ndre]) => ({
  id: date as string,
  acquired_at: `${date as string}T09:17:00Z`,
  platform: 'sentinel-2a',
  scene_cloud_cover: 5,
  parcel_cloud_cover: ndvi === null ? 100 : 0,
  ndvi: ndvi === null ? null : index(ndvi as number),
  ndre: ndre === null ? null : index(ndre as number),
  ndvi_map: null,
}))

function hover(target: Element, ratio: number) {
  const svg = target.closest('svg')
  if (!svg) throw new Error('нет графика')
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 640, height: 240 }) as DOMRect
  fireEvent.pointerMove(target, { clientX: 640 * ratio })
}

describe('VegetationChart', () => {
  it('подписан, с легендой, линиями двух индексов и подписями у концов', () => {
    const { container } = render(
      <VegetationChart observations={observations} />,
    )

    expect(
      screen.getByRole('img', { name: /График NDVI и NDRE: 3 снимков/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('NDVI — биомасса')).toBeInTheDocument()
    expect(screen.getByText('NDRE — хлорофилл')).toBeInTheDocument()
    expect(container.querySelectorAll('path')).toHaveLength(2)
    expect(screen.getByText('NDVI', { selector: 'text' })).toBeInTheDocument()
    // Деления оси — начала месяцев
    expect(screen.getAllByText(/^июн/)).toHaveLength(1)
  })

  it('при наведении показывает значения ближайшего снимка', () => {
    render(<VegetationChart observations={observations} />)
    const area = screen.getByTestId('chart-hover')

    // Середина сезона — ближе всего снимок 25 июня
    hover(area, 0.5)

    const tooltip = screen.getByRole('status')
    expect(tooltip).toHaveTextContent('25 июн. 2026 г.')
    expect(tooltip).toHaveTextContent('NDVI 0,79')
    expect(tooltip).toHaveTextContent('NDRE 0,45')

    // У правого края подсказка разворачивается влево, чтобы не выйти за график
    hover(area, 0.95)
    expect(screen.getByRole('status')).toHaveTextContent('11 окт. 2026 г.')
    expect(screen.getByRole('status').style.transform).toBe('translateX(-105%)')

    fireEvent.pointerLeave(area)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('наведение не пересчитывает пути линий', () => {
    const paths = vi.spyOn(timeSeriesChart, 'linePath')
    render(<VegetationChart observations={observations} />)
    const drawn = paths.mock.calls.length

    hover(screen.getByTestId('chart-hover'), 0.5)
    hover(screen.getByTestId('chart-hover'), 0.9)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(paths).toHaveBeenCalledTimes(drawn)
  })

  it('без размеров графика наведение ничего не делает', () => {
    render(<VegetationChart observations={observations} />)
    const area = screen.getByTestId('chart-hover')

    fireEvent.pointerMove(area, { clientX: 100 })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('рисуется в ширину контейнера и откликается на касание', () => {
    let resize: ResizeObserverCallback = () => {}
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback
        }
        observe() {}
        disconnect = disconnect
      },
    )
    const { unmount } = render(<VegetationChart observations={observations} />)
    const chart = screen.getByRole('img')

    // Экран телефона: график шириной 350 пикселей, а не 640 единиц
    act(() =>
      resize(
        [{ contentRect: { width: 350 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      ),
    )
    expect(chart.getAttribute('viewBox')).toBe('0 0 350 240')
    // Уже 280 пикселей график не сжимается: подписи останутся читаемыми
    act(() =>
      resize(
        [{ contentRect: { width: 200 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      ),
    )
    expect(chart.getAttribute('viewBox')).toBe('0 0 280 240')
    // Скрытый контейнер (ширина 0) размер не сбрасывает
    act(() =>
      resize(
        [{ contentRect: { width: 0 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      ),
    )
    expect(chart.getAttribute('viewBox')).toBe('0 0 280 240')

    const area = screen.getByTestId('chart-hover')
    expect(area.style.touchAction).toBe('pan-y')
    chart.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 280, height: 240 }) as DOMRect
    fireEvent.pointerDown(area, { clientX: 140 })
    expect(screen.getByRole('status')).toHaveTextContent('25 июн. 2026 г.')

    unmount()
    expect(disconnect).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('без снимков с индексами не рисуется', () => {
    const { container } = render(
      <VegetationChart observations={[observations[1]]} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
