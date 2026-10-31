import { describe, expect, it } from 'vitest'
import { calculateSpray } from './sprayCalculator'

const input = { areaHa: 2, ratePerHa: 1.5, waterPerHa: 500, tankLiters: 400 }

describe('calculateSpray', () => {
  it('считает препарат, воду и баки', () => {
    expect(calculateSpray(input)).toEqual({
      product: 3,
      water: 1000,
      tanks: 3,
      productPerTank: 1.2,
    })
  })

  it.each(['areaHa', 'ratePerHa', 'waterPerHa', 'tankLiters'])(
    'без значения %s ответа нет',
    (field) => {
      expect(calculateSpray({ ...input, [field]: 0 })).toBeNull()
    },
  )
})
