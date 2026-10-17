import { describe, expect, it } from 'vitest'
import { risk, season } from '@/test/riskData'
import {
  dailyRisk,
  dayTime,
  infectionDays,
  localToday,
  maxLevel,
  methodSeries,
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
})
