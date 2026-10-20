import type { VegetationObservation } from '@/api/vegetation'
import {
  linePath as timeLinePath,
  timeScales,
  type AxisRange,
  type TimePoint,
} from '@/lib/timeSeriesChart'

export { CHART, monthTicks, nearestIndex } from '@/lib/timeSeriesChart'

export type ChartPoint = TimePoint & {
  ndvi: number
  ndre: number
  cloud: number | null
}

// На линии — только снимки с индексами: облачные дают пропуск в ряду, а не ноль
export function chartPoints(observations: VegetationObservation[]) {
  return observations.flatMap((item) =>
    item.ndvi && item.ndre
      ? [
          {
            time: Date.parse(item.acquired_at),
            ndvi: item.ndvi.mean,
            ndre: item.ndre.mean,
            cloud: item.parcel_cloud_cover,
          },
        ]
      : [],
  )
}

// Ось индексов — от 0 (или ниже, если индекс отрицательный: вода, тень) до 1
export function indexRange(values: number[]): AxisRange {
  const lowest = Math.min(0, ...values)
  return { min: Math.floor(lowest * 4) / 4, max: 1, step: 0.25 }
}

export function chartRange(points: ChartPoint[]) {
  return indexRange(points.flatMap((point) => [point.ndvi, point.ndre]))
}

export function chartScales(points: ChartPoint[], width?: number) {
  return timeScales(
    points.map((point) => point.time),
    chartRange(points),
    undefined,
    width,
  )
}

export function linePath(
  points: ChartPoint[],
  key: 'ndvi' | 'ndre',
  x: (time: number) => number,
  y: (value: number) => number,
) {
  return timeLinePath(points, (point) => point[key], x, y)
}
