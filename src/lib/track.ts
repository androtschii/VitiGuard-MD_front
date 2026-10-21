// Трек обхода виноградника (pr-084): точки GPS телефона, расстояние и время,
// выгрузка в GPX — формат, который открывают навигаторы и ГИС
import type { FeatureCollection } from 'geojson'
import { lineLengthMeters } from './geo'

export type TrackPoint = {
  lng: number
  lat: number
  // Погрешность определения, м
  accuracy: number
  // Время, мс с 1970 года
  time: number
}

export type Track = {
  id: number
  startedAt: string
  points: TrackPoint[]
}

// Точка хуже 30 м — сигнал под кронами или в машине, она рисует зигзаги
export const MAX_ACCURACY_M = 30
// Пока человек стоит, GPS «гуляет» на несколько метров: такие сдвиги не шаги
export const MIN_STEP_M = 3

export function acceptPoint(points: TrackPoint[], next: TrackPoint) {
  if (next.accuracy > MAX_ACCURACY_M) return false
  const last = points.at(-1)
  if (!last) return true
  const step = lineLengthMeters([
    [last.lng, last.lat],
    [next.lng, next.lat],
  ])
  return step >= MIN_STEP_M
}

export function trackStats(points: TrackPoint[]) {
  const first = points[0]
  const last = points.at(-1)
  return {
    meters: lineLengthMeters(points.map((point) => [point.lng, point.lat])),
    durationMs: first && last ? last.time - first.time : 0,
  }
}

export function trackFeatures(points: TrackPoint[]): FeatureCollection {
  const coordinates = points.map((point) => [point.lng, point.lat])
  const last = coordinates.at(-1)
  return {
    type: 'FeatureCollection',
    features: [
      ...(coordinates.length >= 2
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: { type: 'LineString' as const, coordinates },
            },
          ]
        : []),
      // Где человек сейчас (или где закончил обход)
      ...(last
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: { type: 'Point' as const, coordinates: last },
            },
          ]
        : []),
    ],
  }
}

export function trackToGpx(track: Track, name: string) {
  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const points = track.points
    .map(
      (point) =>
        `      <trkpt lat="${point.lat.toFixed(7)}" lon="${point.lng.toFixed(7)}"><time>${new Date(point.time).toISOString()}</time></trkpt>`,
    )
    .join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="VitiGuard MD" xmlns="http://www.topografix.com/GPX/1/1">',
    `  <metadata><time>${track.startedAt}</time></metadata>`,
    `  <trk><name>${escape(name)}</name>`,
    '    <trkseg>',
    points,
    '    </trkseg>',
    '  </trk>',
    '</gpx>',
    '',
  ].join('\n')
}

export function trackBounds(points: TrackPoint[]) {
  const lngs = points.map((point) => point.lng)
  const lats = points.map((point) => point.lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ] as [[number, number], [number, number]]
}
