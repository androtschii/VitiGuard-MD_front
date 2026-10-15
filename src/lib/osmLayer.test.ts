import type { LngLatBounds } from 'maplibre-gl'
import { describe, expect, it } from 'vitest'
import { osmBbox } from './osmLayer'

function bounds(west: number, south: number, east: number, north: number) {
  return {
    getWest: () => west,
    getSouth: () => south,
    getEast: () => east,
    getNorth: () => north,
  } as LngLatBounds
}

describe('osmBbox', () => {
  it('округляет окно до 0,01° наружу', () => {
    expect(osmBbox(bounds(28.851, 47.131, 28.879, 47.149))).toBe(
      '28.85,47.13,28.88,47.15',
    )
  })

  it('мелкий сдвиг карты даёт тот же ключ', () => {
    expect(osmBbox(bounds(28.852, 47.132, 28.878, 47.148))).toBe(
      osmBbox(bounds(28.851, 47.131, 28.879, 47.149)),
    )
  })

  it('не обрезает точные границы', () => {
    expect(osmBbox(bounds(28.85, 47.13, 28.88, 47.15))).toBe(
      '28.85,47.13,28.88,47.15',
    )
  })
})
