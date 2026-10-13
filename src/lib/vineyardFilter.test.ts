import { describe, expect, it } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { filterVineyards, isFiltered, NO_FILTER } from './vineyardFilter'

const merlot = { id: 'merlot', name: 'Merlot', berry_color: 'red' as const }

function vineyard(id: string, area: number, withMerlot: boolean): Vineyard {
  return {
    id,
    name: id,
    area_ha: area,
    variety: withMerlot ? merlot : null,
    planting_year: null,
    geometry: { type: 'MultiPolygon', coordinates: [] },
    created_at: '2026-10-12T10:00:00Z',
    updated_at: '2026-10-12T10:00:00Z',
  }
}

const vineyards = [
  vineyard('small-merlot', 0.5, true),
  vineyard('big-merlot', 12, true),
  vineyard('mid-unknown', 3, false),
]
const ids = (filter = NO_FILTER) =>
  filterVineyards(vineyards, filter).map((item) => item.id)

describe('фильтр участков', () => {
  it('без условий показывает всё', () => {
    expect(ids()).toEqual(['small-merlot', 'big-merlot', 'mid-unknown'])
    expect(isFiltered(NO_FILTER)).toBe(false)
  })

  it('по сорту и по отсутствию сорта', () => {
    expect(ids({ ...NO_FILTER, variety: 'merlot' })).toEqual([
      'small-merlot',
      'big-merlot',
    ])
    expect(ids({ ...NO_FILTER, variety: 'none' })).toEqual(['mid-unknown'])
  })

  it('по площади, границы включительно', () => {
    expect(ids({ ...NO_FILTER, minArea: 3 })).toEqual([
      'big-merlot',
      'mid-unknown',
    ])
    expect(ids({ ...NO_FILTER, maxArea: 3 })).toEqual([
      'small-merlot',
      'mid-unknown',
    ])
    expect(isFiltered({ ...NO_FILTER, maxArea: 3 })).toBe(true)
  })

  it('условия складываются', () => {
    expect(ids({ variety: 'merlot', minArea: 1, maxArea: null })).toEqual([
      'big-merlot',
    ])
  })
})
