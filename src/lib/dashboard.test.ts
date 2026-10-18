import { describe, expect, it } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { summarize } from './dashboard'

function vineyard(id: string, name: string, area_ha: number): Vineyard {
  return {
    id,
    name,
    area_ha,
    geometry: { type: 'MultiPolygon', coordinates: [] },
    variety: null,
    planting_year: null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  }
}

const day = '2026-06-10'

describe('summarize', () => {
  it('считает площадь и участки в риске, опасные — первыми', () => {
    const summary = summarize(
      [
        vineyard('a', 'Яловены', 1.5),
        vineyard('b', 'Криково', 2.25),
        vineyard('c', 'Пуркарь', 3),
        vineyard('d', 'Бульбоака', 0.5),
      ],
      [
        { vineyard_id: 'a', day, downy: 'low', powdery: 'medium' },
        { vineyard_id: 'b', day, downy: 'low', powdery: 'low' },
        { vineyard_id: 'c', day, downy: 'high', powdery: 'low' },
      ],
    )

    expect(summary.count).toBe(4)
    expect(summary.areaHa).toBeCloseTo(7.25)
    expect(summary.high).toBe(1)
    expect(summary.medium).toBe(1)
    expect(summary.rows.map((row) => [row.vineyard.name, row.worst])).toEqual([
      ['Пуркарь', 'high'],
      ['Яловены', 'medium'],
      ['Криково', 'low'],
      ['Бульбоака', null],
    ])
  })

  it('без оценок и участков возвращает нули', () => {
    expect(summarize([])).toEqual({
      count: 0,
      areaHa: 0,
      high: 0,
      medium: 0,
      rows: [],
    })
  })
})
