import { describe, expect, it } from 'vitest'
import type { VegetationObservation } from '@/api/vegetation'
import {
  CHART,
  chartPoints,
  chartScales,
  linePath,
  monthTicks,
  nearestIndex,
} from './vegetationChart'

const index = (mean: number) => ({ mean, min: mean, max: mean, std: 0 })

function observation(
  date: string,
  ndvi: number | null,
  ndre: number | null = ndvi,
): VegetationObservation {
  return {
    id: date,
    acquired_at: `${date}T09:17:00Z`,
    platform: 'sentinel-2a',
    scene_cloud_cover: 5,
    parcel_cloud_cover: ndvi === null ? 100 : 0,
    ndvi: ndvi === null ? null : index(ndvi),
    ndre: ndre === null ? null : index(ndre),
    ndvi_map: null,
  }
}

describe('vegetationChart', () => {
  it('на линию идут только снимки без облаков', () => {
    const points = chartPoints([
      observation('2026-03-07', 0.3, 0.2),
      observation('2026-05-28', null),
      observation('2026-06-25', 0.8, 0.45),
    ])

    expect(points.map((point) => point.ndvi)).toEqual([0.3, 0.8])
    expect(points[1]).toMatchObject({ ndre: 0.45, cloud: 0 })
  })

  it('ось от 0 до 1 и ниже нуля, если индекс отрицательный', () => {
    const positive = chartScales(chartPoints([observation('2026-03-07', 0.3)]))
    const negative = chartScales(
      chartPoints([
        observation('2026-03-07', 0.3),
        observation('2026-04-07', -0.1),
      ]),
    )

    expect(positive.yTicks).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(negative.yTicks[0]).toBe(-0.25)
    expect(positive.y(1)).toBe(CHART.top)
    expect(positive.y(0)).toBe(CHART.height - CHART.bottom)
  })

  it('шкала времени обратима, один снимок не делит на ноль', () => {
    const points = chartPoints([
      observation('2026-03-01', 0.3),
      observation('2026-10-01', 0.4),
    ])
    const { x, invert, first, last } = chartScales(points)
    const single = chartScales(chartPoints([observation('2026-03-01', 0.3)]))

    expect(x(first)).toBe(CHART.left)
    expect(x(last)).toBe(CHART.width - CHART.right)
    expect(invert(x(first + 1000))).toBeCloseTo(first + 1000)
    expect(Number.isFinite(single.x(single.first))).toBe(true)
  })

  it('деления по началам месяцев внутри периода', () => {
    const ticks = monthTicks(
      Date.parse('2026-03-07T00:00:00Z'),
      Date.parse('2026-06-10T00:00:00Z'),
    )

    expect(
      ticks.map((tick) => new Date(tick).toISOString().slice(0, 10)),
    ).toEqual(['2026-04-01', '2026-05-01', '2026-06-01'])
  })

  it('строит путь линии и находит ближайший снимок', () => {
    const points = chartPoints([
      observation('2026-03-01', 0.3),
      observation('2026-04-01', 0.5),
      observation('2026-05-01', 0.7),
    ])

    expect(
      linePath(
        points,
        'ndvi',
        () => 1,
        (value) => value * 10,
      ),
    ).toBe('M1.0,3.0 L1.0,5.0 L1.0,7.0')
    expect(nearestIndex(points, Date.parse('2026-04-10T00:00:00Z'))).toBe(1)
    expect(nearestIndex(points, Date.parse('2026-12-01T00:00:00Z'))).toBe(2)
  })
})
