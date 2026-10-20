import { describe, expect, it } from 'vitest'
import { scan } from '@/test/ndviData'
import { clearNdvi, pairSeries, valueAt } from './compare'

const day = (date: string) => Date.parse(`${date}T09:17:00Z`)

describe('compare', () => {
  it('ряд NDVI — только снимки без облаков, по дате', () => {
    const series = clearNdvi([
      scan('aug', '2026-08-29'),
      scan('cloudy', '2026-07-12', false),
      scan('june', '2026-06-25'),
    ])

    expect(series.map((point) => point.time)).toEqual([
      day('2026-06-25'),
      day('2026-08-29'),
    ])
  })

  it('между снимками значение — на прямой между ними', () => {
    const series = [
      { time: 0, ndvi: 0.4 },
      { time: 10, ndvi: 0.8 },
    ]

    expect(valueAt(series, 0)).toBe(0.4)
    expect(valueAt(series, 5)).toBeCloseTo(0.6)
    expect(valueAt(series, 10)).toBe(0.8)
    expect(valueAt(series, 20)).toBe(0.8)
  })

  it('пары — на всех датах обоих рядов в общем периоде', () => {
    const a = [
      { time: 0, ndvi: 0.3 },
      { time: 10, ndvi: 0.5 },
      { time: 30, ndvi: 0.7 },
    ]
    const b = [
      { time: 5, ndvi: 0.6 },
      { time: 20, ndvi: 0.6 },
      { time: 40, ndvi: 0.2 },
    ]

    const pair = pairSeries(a, b)

    // Общий период — с 5 по 30: точка 0 и точка 40 вне его
    expect(pair.map((point) => point.time)).toEqual([5, 10, 20, 30])
    expect(pair[0]).toEqual({ time: 5, a: 0.4, b: 0.6 })
    expect(pair[3].b).toBeCloseTo(0.4)
  })

  it('без общего периода или без снимков пар нет', () => {
    const early = [{ time: 0, ndvi: 0.3 }]
    const late = [{ time: 10, ndvi: 0.5 }]

    expect(pairSeries(early, late)).toEqual([])
    expect(pairSeries([], late)).toEqual([])
  })
})
