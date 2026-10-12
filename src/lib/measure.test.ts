import { describe, expect, it } from 'vitest'
import { measureFeatures } from './measure'

const types = (count: number) =>
  measureFeatures(
    Array.from({ length: count }, (_, index) => [28.8 + index * 0.01, 47]),
  ).features.map((feature) => feature.geometry.type)

describe('measureFeatures', () => {
  it('одна точка — только точка', () => {
    expect(types(1)).toEqual(['Point'])
  })

  it('с двух точек появляется линия', () => {
    expect(types(2)).toEqual(['Point', 'Point', 'LineString'])
  })

  it('с трёх точек — ещё и замкнутая фигура', () => {
    const polygon = measureFeatures([
      [28.8, 47],
      [28.81, 47],
      [28.81, 47.01],
    ]).features.at(-1)

    expect(types(3).at(-1)).toBe('Polygon')
    expect(polygon?.geometry).toEqual({
      type: 'Polygon',
      coordinates: [
        [
          [28.8, 47],
          [28.81, 47],
          [28.81, 47.01],
          [28.8, 47],
        ],
      ],
    })
  })
})
