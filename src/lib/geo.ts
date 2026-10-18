import type { MultiPolygon, Polygon, Position } from 'geojson'

// Средний радиус Земли (IUGG), как в Turf: для расчётов на сфере он точнее
// экваториального радиуса WGS84
const EARTH_RADIUS = 6_371_008.8

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

// Площадь кольца на сфере (Chamberlain, Duquette: «Some Algorithms for Polygons
// on a Sphere», JPL, 2007). На широте Молдовы расхождение с расчётом
// по эллипсоиду (PostGIS, geography) — доли процента
function ringArea(ring: Position[]) {
  let total = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1 = 0, lat1 = 0] = ring[i] ?? []
    const [lon2 = 0, lat2 = 0] = ring[i + 1] ?? []
    total +=
      toRadians(lon2 - lon1) *
      (2 + Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)))
  }
  return Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2)
}

// Внешний контур минус дыры: участок может огибать постройку или пруд
export function polygonAreaSquareMeters(polygon: Polygon) {
  const [outer = [], ...holes] = polygon.coordinates
  return holes.reduce((area, hole) => area - ringArea(hole), ringArea(outer))
}

// Длина ломаной по сфере (формула гаверсинусов), в метрах
export function lineLengthMeters(points: Position[]) {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [lon1 = 0, lat1 = 0] = points[i] ?? []
    const [lon2 = 0, lat2 = 0] = points[i + 1] ?? []
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2
    total += 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h))
  }
  return total
}

export function squareMetersToHectares(squareMeters: number) {
  return squareMeters / 10_000
}

export type Bounds = [[number, number], [number, number]]

// Прямоугольник, в который помещаются все контуры, — для fitBounds карты.
// Достаточно внешних колец: дыры лежат внутри них
export function boundsOf(geometries: MultiPolygon[]): Bounds | null {
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity
  for (const geometry of geometries) {
    for (const [outer = []] of geometry.coordinates) {
      for (const [lon = 0, lat = 0] of outer) {
        west = Math.min(west, lon)
        south = Math.min(south, lat)
        east = Math.max(east, lon)
        north = Math.max(north, lat)
      }
    }
  }
  return west === Infinity
    ? null
    : [
        [west, south],
        [east, north],
      ]
}

// Луч из точки вправо: нечётное число пересечений — точка внутри кольца
function ringContains(ring: Position[], [x, y]: Position) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi = 0, yi = 0] = ring[i] ?? []
    const [xj = 0, yj = 0] = ring[j] ?? []
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

// Лежит ли точка [долгота, широта] на участке: внутри контура и не в дыре.
// Участки — сотни метров, поэтому плоская геометрия в градусах достаточна
export function containsPoint(geometry: MultiPolygon, point: Position) {
  return geometry.coordinates.some(
    ([outer = [], ...holes]) =>
      ringContains(outer, point) &&
      !holes.some((hole) => ringContains(hole, point)),
  )
}
