import type { Geometry, MultiPolygon, Polygon, Position } from 'geojson'

// Схема для главной: долгота сжимается на косинус широты, чтобы страна не
// выглядела растянутой вширь (равнопромежуточная проекция; для одной страны
// искажения не видны)
export type Projection = {
  width: number
  height: number
  project: (point: Position) => [number, number]
}

export type Bounds = [number, number, number, number]

export function boundsOf(geometries: Geometry[]): Bounds {
  let [minLon, minLat, maxLon, maxLat] = [
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
  ]
  for (const ring of geometries.flatMap(rings)) {
    for (const [lon = 0, lat = 0] of ring) {
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    }
  }
  return [minLon, minLat, maxLon, maxLat]
}

export function projection(
  [minLon, minLat, maxLon, maxLat]: Bounds,
  width: number,
): Projection {
  const scaleX = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180)
  const spanX = (maxLon - minLon) * scaleX || 1
  const k = width / spanX
  const height = Math.max(1, (maxLat - minLat) * k)
  return {
    width,
    height,
    project: ([lon = 0, lat = 0]) => [
      (lon - minLon) * scaleX * k,
      (maxLat - lat) * k,
    ],
  }
}

function rings(geometry: Geometry): Position[][] {
  if (geometry.type === 'Polygon') return geometry.coordinates
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat()
  return []
}

// Контур в путь SVG; координаты округляются до 0,1: схема маленькая
export function svgPath(
  geometry: Polygon | MultiPolygon | Geometry,
  view: Projection,
): string {
  return rings(geometry)
    .map(
      (ring) =>
        ring
          .map((point, index) => {
            const [x, y] = view.project(point)
            return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
          })
          .join('') + 'Z',
    )
    .join('')
}
