import { describe, expect, it } from 'vitest'
import { risk, season } from '@/test/riskData'
import {
  dailyRisk,
  dayTime,
  infectionDays,
  localToday,
  maxLevel,
  methodSeries,
  niceRange,
  weatherSeries,
} from './riskSeries'

describe('riskSeries', () => {
  it('худший уровень дня', () => {
    expect(maxLevel([])).toBe('low')
    expect(maxLevel(['low', 'high', 'medium'])).toBe('high')
    expect(maxLevel(['medium', 'low'])).toBe('medium')
  })

  it('сегодня — по времени Кишинёва', () => {
    // 22:30 UTC 31 мая — в Кишинёве уже 1 июня
    expect(localToday(new Date('2026-05-31T22:30:00Z'))).toBe('2026-06-01')
  })

  it('риск по дням: худшая из моделей милдью, прогноз отмечен', () => {
    const days = dailyRisk(season())

    expect(days.map((day) => day.day)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-10',
      '2026-06-11',
    ])
    expect(days[1]).toEqual({
      day: '2026-06-02',
      downy: 'high',
      powdery: 'low',
      forecast: false,
    })
    expect(days[3]).toMatchObject({
      downy: 'high',
      powdery: 'medium',
      forecast: true,
    })
  })

  it('ряды моделей в процентах и дни заражения', () => {
    expect(methodSeries(season(), 'gubler_thomas')).toEqual([
      { time: dayTime('2026-06-01'), value: 20 },
      { time: dayTime('2026-06-10'), value: 80 },
      { time: dayTime('2026-06-11'), value: 50 },
    ])
    expect(methodSeries(season(), 'goidanich').map((p) => p.value)).toEqual([
      0, 63, 100,
    ])
    expect(infectionDays(season())).toEqual(['2026-06-02'])
    expect(infectionDays([risk('2026-06-01', 'three_tens', 0)])).toEqual([])
  })

  it('погода дня из факторов Гойданича, без осадков в старых записях', () => {
    expect(
      weatherSeries([
        risk('2026-06-01', 'goidanich', 0, 'low', {
          mean_temp: 18.4,
          precipitation_mm: 12.5,
        }),
        risk('2026-06-02', 'goidanich', 0, 'low', { mean_temp: 21 }),
        risk('2026-06-02', 'gubler_thomas', 0.2, 'low', { index: 20 }),
        risk('2026-06-03', 'goidanich', 0, 'low', {}),
      ]),
    ).toEqual([
      { time: dayTime('2026-06-01'), temperature: 18.4, precipitation: 12.5 },
      { time: dayTime('2026-06-02'), temperature: 21, precipitation: null },
    ])
  })

  it('границы оси кратны шагу и включают ноль', () => {
    expect(niceRange([12.3, 27.8], 10, 0)).toEqual({
      min: 0,
      max: 30,
      step: 10,
    })
    expect(niceRange([-4, 18], 10, 0)).toEqual({ min: -10, max: 20, step: 10 })
    expect(niceRange([0, 0], 10, 0)).toEqual({ min: 0, max: 10, step: 10 })
    expect(niceRange([12, 18], 5)).toEqual({ min: 10, max: 20, step: 5 })
  })
})
