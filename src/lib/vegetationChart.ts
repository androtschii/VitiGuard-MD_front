import type { VegetationObservation } from '@/api/vegetation'

// Размеры графика в единицах viewBox; SVG растягивается по ширине окна
export const CHART = {
  width: 640,
  height: 240,
  left: 40,
  right: 56,
  top: 12,
  bottom: 28,
}

export type ChartPoint = {
  time: number
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

export function chartScales(points: ChartPoint[]) {
  const times = points.map((point) => point.time)
  const first = Math.min(...times)
  // Один снимок — всё равно ось шириной в сутки, чтобы не делить на ноль
  const last = Math.max(...times, first + 86_400_000)
  const lowest = Math.min(0, ...points.map((p) => Math.min(p.ndvi, p.ndre)))
  // Ось от 0 (или ниже, если индекс отрицательный — вода, тень) до 1
  const minY = Math.floor(lowest * 4) / 4
  const plotWidth = CHART.width - CHART.left - CHART.right
  const plotHeight = CHART.height - CHART.top - CHART.bottom
  const x = (time: number) =>
    CHART.left + ((time - first) / (last - first)) * plotWidth
  const y = (value: number) =>
    CHART.top + ((1 - value) / (1 - minY)) * plotHeight
  const invert = (svgX: number) =>
    first + ((svgX - CHART.left) / plotWidth) * (last - first)
  const yTicks: number[] = []
  for (let value = minY; value <= 1 + 1e-9; value += 0.25) {
    yTicks.push(Math.round(value * 100) / 100)
  }
  return { x, y, invert, first, last, yTicks }
}

// Начала месяцев внутри периода — деления оси времени
export function monthTicks(first: number, last: number) {
  const ticks: number[] = []
  const start = new Date(first)
  let month = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)
  while (month <= last) {
    ticks.push(month)
    const date = new Date(month)
    month = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
  }
  return ticks
}

export function linePath(
  points: ChartPoint[],
  key: 'ndvi' | 'ndre',
  x: (time: number) => number,
  y: (value: number) => number,
) {
  return points
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'}${x(point.time).toFixed(1)},${y(point[key]).toFixed(1)}`,
    )
    .join(' ')
}

// Снимок, ближайший по времени к позиции курсора
export function nearestIndex(points: ChartPoint[], time: number) {
  let best = 0
  points.forEach((point, index) => {
    if (Math.abs(point.time - time) < Math.abs(points[best].time - time)) {
      best = index
    }
  })
  return best
}
