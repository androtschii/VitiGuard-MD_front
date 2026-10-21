import { describe, expect, it } from 'vitest'
import {
  acceptPoint,
  trackBounds,
  trackFeatures,
  trackStats,
  trackToGpx,
  type TrackPoint,
} from './track'

// Шаг — десятитысячная градуса широты: около 11 м на север и минута времени
const point = (step: number, extra: Partial<TrackPoint> = {}): TrackPoint => ({
  lng: 28.86,
  lat: 47.14 + step * 0.0001,
  accuracy: 5,
  time: Date.parse('2026-06-10T07:00:00Z') + step * 60_000,
  ...extra,
})

describe('track', () => {
  it('первая точка принимается, если она достаточно точна', () => {
    expect(acceptPoint([], point(0))).toBe(true)
    expect(acceptPoint([], point(0, { accuracy: 45 }))).toBe(false)
  })

  it('дрожание GPS на месте не считается шагом', () => {
    const still = point(0, { lat: 47.14 + 0.00001 })

    expect(acceptPoint([point(0)], still)).toBe(false)
    expect(acceptPoint([point(0)], point(1))).toBe(true)
  })

  it('считает расстояние и время обхода', () => {
    const stats = trackStats([point(0), point(1), point(2)])

    expect(stats.meters).toBeCloseTo(22.2, 0)
    expect(stats.durationMs).toBe(120_000)
    expect(trackStats([])).toEqual({ meters: 0, durationMs: 0 })
  })

  it('на карте — линия и текущее место', () => {
    expect(trackFeatures([]).features).toEqual([])
    expect(
      trackFeatures([point(0)]).features.map((f) => f.geometry.type),
    ).toEqual(['Point'])
    expect(
      trackFeatures([point(0), point(1)]).features.map((f) => f.geometry.type),
    ).toEqual(['LineString', 'Point'])
  })

  it('границы трека для приближения карты', () => {
    expect(
      trackBounds([point(2, { lng: 28.87 }), point(0, { lng: 28.85 })]),
    ).toEqual([
      [28.85, 47.14],
      [28.87, 47.1402],
    ])
  })

  it('выгружает GPX 1.1 со временем точек', () => {
    const gpx = trackToGpx(
      {
        id: 1,
        startedAt: '2026-06-10T07:00:00.000Z',
        points: [point(0), point(1)],
      },
      'Обход <Криково> & соседи',
    )

    expect(gpx).toContain('<gpx version="1.1" creator="VitiGuard MD"')
    expect(gpx).toContain('<name>Обход &lt;Криково&gt; &amp; соседи</name>')
    expect(gpx).toContain(
      '<trkpt lat="47.1401000" lon="28.8600000"><time>2026-06-10T07:01:00.000Z</time></trkpt>',
    )
    expect(gpx.match(/<trkpt /g)).toHaveLength(2)
  })
})
