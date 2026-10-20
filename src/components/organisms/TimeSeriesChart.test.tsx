import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TimeSeriesChart } from './TimeSeriesChart'

const DAY = 86_400_000
const at = (day: string) => Date.parse(`${day}T00:00:00Z`)

type Point = { time: number; temperature: number; rain: number }

// Сезон с марта по октябрь, по точке в начале каждого месяца
const points: Point[] = [
  '2026-03-01',
  '2026-04-01',
  '2026-05-01',
  '2026-06-01',
  '2026-07-01',
  '2026-08-01',
  '2026-09-01',
  '2026-10-01',
].map((day, index) => ({
  time: at(day),
  temperature: 5 + index * 3,
  rain: index % 2 ? 6 : 0,
}))

function renderChart(
  props: Partial<Parameters<typeof TimeSeriesChart<Point>>[0]> = {},
) {
  return render(
    <TimeSeriesChart<Point>
      points={points}
      range={{ min: 0, max: 30, step: 10 }}
      label="Погода сезона"
      formatValue={(value) => `${value} °C`}
      series={[
        {
          key: 'temperature',
          label: 'Т',
          color: 'red',
          value: (point) => point.temperature,
        },
      ]}
      {...props}
    />,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TimeSeriesChart', () => {
  it('одну линию называет заголовок: без легенды и подписи у конца', () => {
    const { container } = renderChart()

    expect(
      screen.getByRole('img', { name: 'Погода сезона' }),
    ).toBeInTheDocument()
    expect(container.querySelector('figcaption')).toBeNull()
    expect(screen.queryByText('Т', { selector: 'text' })).toBeNull()
    // Деления оси значений с подписями
    expect(screen.getByText('0 °C')).toBeInTheDocument()
    expect(screen.getByText('30 °C')).toBeInTheDocument()
  })

  it('столбцы — только для дней с осадками, в легенде — квадрат', () => {
    const { container } = renderChart({
      series: [
        {
          key: 'rain',
          label: 'Осадки',
          legend: 'Осадки за сутки',
          kind: 'bar',
          color: 'blue',
          value: (point) => point.rain,
        },
      ],
    })

    expect(
      screen.getByTestId('chart-bars-rain').querySelectorAll('rect'),
    ).toHaveLength(4)
    expect(screen.getByText('Осадки за сутки')).toBeInTheDocument()
    expect(container.querySelector('figcaption rect')).not.toBeNull()
  })

  it('сегодня — линия с подписью, правее — затенённый прогноз', () => {
    renderChart({ today: at('2026-08-15'), todayLabel: 'сегодня' })

    expect(screen.getByText('сегодня')).toBeInTheDocument()
    expect(screen.getByTestId('chart-forecast')).toBeInTheDocument()
  })

  it('сегодня после конца данных — без затенения и линии', () => {
    renderChart({ today: at('2026-12-01') + DAY, todayLabel: 'сегодня' })

    expect(screen.queryByTestId('chart-forecast')).toBeNull()
    expect(screen.queryByText('сегодня')).toBeNull()
  })

  it('события на оси подписаны', () => {
    renderChart({
      markers: [{ time: at('2026-06-02'), label: 'Заражение 2 июня' }],
    })

    expect(
      screen.getByText('Заражение 2 июня', { selector: 'title' }),
    ).toBeInTheDocument()
  })

  it('на узком графике подписи месяцев прореживаются', () => {
    let resize: ResizeObserverCallback = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    const { container } = renderChart()
    // Подписи месяцев — по центру деления, подписи значений — справа
    const months = () =>
      container.querySelectorAll('text[text-anchor="middle"]').length
    // Начала месяцев с апреля по октябрь
    expect(months()).toBe(7)

    act(() =>
      resize(
        [{ contentRect: { width: 300 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      ),
    )

    expect(months()).toBe(4)
  })
})
