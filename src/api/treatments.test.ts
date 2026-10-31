import { describe, expect, it } from 'vitest'
import { harvestAllowedFrom, type Treatment } from './treatments'

const treatment = (applied_on: string, waiting_days: number | null) =>
  ({ applied_on, waiting_days }) as Treatment

describe('harvestAllowedFrom', () => {
  it('берёт самый поздний срок, а не последнюю обработку', () => {
    expect(
      harvestAllowedFrom(
        [treatment('2026-06-01', 30), treatment('2026-06-08', 7)],
        '2026-06-10',
      ),
    ).toBe('2026-07-01')
  })

  it('считает через границу месяца', () => {
    expect(
      harvestAllowedFrom([treatment('2026-08-25', 10)], '2026-08-26'),
    ).toBe('2026-09-04')
  })

  it('прошедший срок и пустой журнал ничего не ограничивают', () => {
    expect(
      harvestAllowedFrom([treatment('2026-06-01', 3)], '2026-06-10'),
    ).toBeNull()
    expect(
      harvestAllowedFrom([treatment('2026-06-01', 9)], '2026-06-10'),
    ).toBeNull()
    expect(
      harvestAllowedFrom([treatment('2026-06-10', null)], '2026-06-10'),
    ).toBeNull()
    expect(harvestAllowedFrom([], '2026-06-10')).toBeNull()
  })
})
