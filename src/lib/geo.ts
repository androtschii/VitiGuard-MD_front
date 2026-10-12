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
