import { describe, expect, it } from 'vitest'
import { scan } from '@/test/ndviData'
import { latestNdviMap, ndviLayerId } from './ndviLayer'

describe('ndviLayer', () => {
  it('берёт последний снимок с картограммой, пропуская облачные', () => {
    const history = [
      scan('june', '2026-06-25'),
      scan('august', '2026-08-29'),
      scan('cloudy', '2026-09-03', false),
    ]

    expect(latestNdviMap(history)?.id).toBe('august')
  })

  it('без картограмм — ничего', () => {
    expect(latestNdviMap([scan('cloudy', '2026-09-03', false)])).toBeNull()
    expect(latestNdviMap([])).toBeNull()
  })

  it('у слоя каждого участка свой идентификатор', () => {
    expect(ndviLayerId('vineyard-1')).toBe('ndvi-vineyard-1')
  })
})
