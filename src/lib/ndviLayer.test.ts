import { describe, expect, it } from 'vitest'
import { scan } from '@/test/ndviData'
import { latestNdviMap, ndviDays, ndviLayerId } from './ndviLayer'

describe('ndviLayer', () => {
  it('берёт последний снимок с картограммой, пропуская облачные', () => {
    const history = [
      scan('june', '2026-06-25'),
      scan('august', '2026-08-29'),
      scan('cloudy', '2026-09-03', false),
    ]

    expect(latestNdviMap(history)?.id).toBe('august')
  })

  it('на выбранный день — последний снимок не позже него', () => {
    const history = [
      scan('june', '2026-06-25'),
      scan('july', '2026-07-12', false),
      scan('august', '2026-08-29'),
    ]

    expect(latestNdviMap(history, '2026-07-31')?.id).toBe('june')
    expect(latestNdviMap(history, '2026-08-29')?.id).toBe('august')
    expect(latestNdviMap(history, '2026-06-01')).toBeNull()
  })

  it('дни шкалы — с картограммой хотя бы у одного участка, без повторов', () => {
    const days = ndviDays([
      [scan('a', '2026-08-29'), scan('b', '2026-07-12', false)],
      [scan('c', '2026-06-25'), scan('d', '2026-08-29')],
      undefined,
    ])

    expect(days).toEqual(['2026-06-25', '2026-08-29'])
  })

  it('без картограмм — ничего', () => {
    expect(latestNdviMap([scan('cloudy', '2026-09-03', false)])).toBeNull()
    expect(latestNdviMap([])).toBeNull()
  })

  it('у слоя каждого участка свой идентификатор', () => {
    expect(ndviLayerId('vineyard-1')).toBe('ndvi-vineyard-1')
  })
})
