import { describe, expect, it } from 'vitest'
import { dayTime } from '@/lib/riskSeries'
import { inPeriod, periodRange, SEASON, seasonStart } from './period'

const at = (day: string) => dayTime(day)

describe('period', () => {
  it('сезон — с 1 марта, до марта — прошлогодний', () => {
    expect(seasonStart('2026-08-29')).toBe(at('2026-03-01'))
    expect(seasonStart('2026-03-01')).toBe(at('2026-03-01'))
    expect(seasonStart('2027-01-15')).toBe(at('2026-03-01'))
  })

  it('неделя, месяц и сезон — назад от опорного дня, вперёд без границы', () => {
    const reference = '2026-08-29'

    expect(periodRange({ ...SEASON, kind: 'week' }, reference)).toEqual({
      from: at('2026-08-22'),
      to: Infinity,
    })
    expect(periodRange({ ...SEASON, kind: 'month' }, reference).from).toBe(
      at('2026-07-30'),
    )
    expect(periodRange(SEASON, reference).from).toBe(at('2026-03-01'))
  })

  it('свои даты — включительно, пустая граница не ограничивает', () => {
    const range = periodRange(
      { kind: 'custom', from: '2026-06-01', to: '2026-06-30' },
      '2026-08-29',
    )
    const points = [
      '2026-05-31',
      '2026-06-01',
      '2026-06-30T23:00:00Z',
      '2026-07-01',
    ].map((day) => ({
      time: Date.parse(day.includes('T') ? day : `${day}T00:00:00Z`),
    }))

    expect(inPeriod(points, (point) => point.time, range)).toEqual([
      points[1],
      points[2],
    ])
    expect(
      periodRange({ kind: 'custom', from: '', to: '' }, '2026-08-29'),
    ).toEqual({ from: -Infinity, to: Infinity })
  })
})
