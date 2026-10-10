import type { Polygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import { polygonAreaSquareMeters, squareMetersToHectares } from './geo'

// Квадрат 0.01° × 0.01° у Кишинёва (47° с. ш.): около 760 × 1110 м, 84 га
const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [28.8, 47.0],
      [28.81, 47.0],
      [28.81, 47.01],
      [28.8, 47.01],
      [28.8, 47.0],
    ],
  ],
}

describe('площадь участка', () => {
  it('совпадает с эталоном Turf для того же контура', () => {
    // turf.area (@turf/area 7.2) для этого квадрата: 843 167 м²
    expect(polygonAreaSquareMeters(square)).toBeCloseTo(843_167, 0)
  })

  it('не зависит от направления обхода контура', () => {
    const reversed: Polygon = {
      type: 'Polygon',
      coordinates: [[...(square.coordinates[0] ?? [])].reverse()],
    }

    expect(polygonAreaSquareMeters(reversed)).toBeCloseTo(
      polygonAreaSquareMeters(square),
    )
  })

  it('вычитает дыры', () => {
    const withHole: Polygon = {
      type: 'Polygon',
      coordinates: [
        ...square.coordinates,
        [
          [28.802, 47.002],
          [28.804, 47.002],
          [28.804, 47.004],
          [28.802, 47.004],
          [28.802, 47.002],
        ],
      ],
    }

    const hole = polygonAreaSquareMeters({
      type: 'Polygon',
      coordinates: withHole.coordinates.slice(1),
    })
    expect(polygonAreaSquareMeters(withHole)).toBeCloseTo(
      polygonAreaSquareMeters(square) - hole,
    )
  })

  it('пустой контур — нулевая площадь', () => {
    expect(polygonAreaSquareMeters({ type: 'Polygon', coordinates: [] })).toBe(
      0,
    )
  })

  it('переводит квадратные метры в гектары', () => {
    expect(squareMetersToHectares(25_000)).toBe(2.5)
  })
})
