import type { FeatureCollection, Position } from 'geojson'

// Ломаная по точкам; с трёх точек — ещё и замкнутая фигура для площади
export function measureFeatures(points: Position[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      ...points.map((point) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'Point' as const, coordinates: point },
      })),
      ...(points.length >= 2
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: { type: 'LineString' as const, coordinates: points },
            },
          ]
        : []),
      ...(points.length >= 3
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Polygon' as const,
                coordinates: [[...points, points[0] ?? []]],
              },
            },
          ]
        : []),
    ],
  }
}
