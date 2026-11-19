import { describe, expect, it } from 'vitest'
import { scan } from '@/test/ndviData'
import { aggregateNdviByDate, clearNdvi, pairSeries, valueAt } from './compare'

const day = (date: string) => Date.parse(`${date}T09:17:00Z`)

describe('compare', () => {
  it('aggregateNdviByDate сортирует точки и усредняет значения за один день', () => {
    expect(aggregateNdviByDate([])).toEqual([])

    const t1a = Date.parse('2026-06-25T09:15:00Z')
    const t1b = Date.parse('2026-06-25T11:45:00Z')
    const t2 = Date.parse('2026-06-20T10:00:00Z')
    const t3 = Date.parse('2026-07-01T09:00:00Z')

    const points = [
      { time: t1b, ndvi: 0.8 },
      { time: t3, ndvi: 0.7 },
      { time: t1a, ndvi: 0.4 },
      { time: t2, ndvi: 0.5 },
    ]

    const result = aggregateNdviByDate(points)

    expect(result).toEqual([
      { time: t2, ndvi: 0.5 },
      { time: t1a, ndvi: 0.6 }, // (0.4 + 0.8) / 2
      { time: t3, ndvi: 0.7 },
    ])
  })

  it('ряд NDVI — только снимки без облаков, по дате с усреднением за один день', () => {
    const s1 = scan('aug', '2026-08-29')
    const s2 = scan('cloudy', '2026-07-12', false)
    const s3 = scan('june-1', '2026-06-25')
    const s4 = {
      ...scan('june-2', '2026-06-25'),
      acquired_at: '2026-06-25T11:00:00Z',
      ndvi: { mean: 0.81, min: 0.7, max: 0.9, std: 0.05 },
    }

    const series = clearNdvi([s1, s2, s4, s3])

    expect(series).toHaveLength(2)
    expect(series[0].time).toBe(day('2026-06-25'))
    // (0.71 + 0.81) / 2 = 0.76
    expect(series[0].ndvi).toBeCloseTo(0.76)
    expect(series[1].time).toBe(day('2026-08-29'))
    expect(series[1].ndvi).toBeCloseTo(0.71)
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
