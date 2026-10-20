import { describe, expect, it } from 'vitest'
import { risk, season } from '@/test/riskData'
import { dayAdvice } from './recommendations'

describe('dayAdvice', () => {
  it('заражение по «трём десяткам»', () => {
    expect(dayAdvice(season(), '2026-06-02')).toEqual(['downyInfection'])
  })

  it('инкубация и высокий риск оидиума в один день', () => {
    // 10 июня: инкубация 63 %, индекс Gubler-Thomas 80
    expect(dayAdvice(season(), '2026-06-10')).toEqual([
      'downyIncubation',
      'powderyHigh',
    ])
  })

  it('ожидаются пятна и средний риск оидиума', () => {
    expect(dayAdvice(season(), '2026-06-11')).toEqual([
      'downySymptoms',
      'powderyMedium',
    ])
  })

  it('спокойный день и день без оценок', () => {
    expect(
      dayAdvice(
        [
          risk('2026-07-01', 'three_tens', 0),
          risk('2026-07-01', 'goidanich', 0.1, 'low', {}),
          risk('2026-07-01', 'gubler_thomas', 0.2, 'low', { index: 20 }),
        ],
        '2026-07-01',
      ),
    ).toEqual(['calm'])
    expect(dayAdvice([], '2026-07-02')).toEqual(['calm'])
  })
})
