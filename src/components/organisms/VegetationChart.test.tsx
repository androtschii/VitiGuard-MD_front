import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { VegetationObservation } from '@/api/vegetation'
import { VegetationChart } from './VegetationChart'

const index = (mean: number) => ({ mean, min: mean, max: mean, std: 0 })

const observations: VegetationObservation[] = [
  ['2026-03-07', 0.31, 0.22],
  ['2026-05-28', null, null],
  ['2026-06-25', 0.79, 0.45],
  ['2026-10-11', 0.41, 0.24],
].map(([date, ndvi, ndre]) => ({
  acquired_at: `${date as string}T09:17:00Z`,
  platform: 'sentinel-2a',
  scene_cloud_cover: 5,
  parcel_cloud_cover: ndvi === null ? 100 : 0,
  ndvi: ndvi === null ? null : index(ndvi as number),
  ndre: ndre === null ? null : index(ndre as number),
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

  it('без размеров графика наведение ничего не делает', () => {
    render(<VegetationChart observations={observations} />)
    const area = screen.getByTestId('chart-hover')

    fireEvent.pointerMove(area, { clientX: 100 })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('без снимков с индексами не рисуется', () => {
    const { container } = render(
      <VegetationChart observations={[observations[1]]} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
