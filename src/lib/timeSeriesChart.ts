// Общая геометрия графиков по датам: индексы вегетации, риск болезней

// Размеры графика в единицах viewBox; SVG растягивается по ширине окна
export const CHART = {
  width: 640,
  height: 240,
  left: 40,
  right: 56,
  top: 12,
  bottom: 28,
}

export type TimePoint = { time: number }

const DAY = 86_400_000

export function timeScales(
  times: number[],
  { min, max, step }: { min: number; max: number; step: number },
  height = CHART.height,
) {
  const first = Math.min(...times)
  // Один день данных — всё равно ось шириной в сутки, чтобы не делить на ноль
  const last = Math.max(...times, first + DAY)
  const plotWidth = CHART.width - CHART.left - CHART.right
  const plotHeight = height - CHART.top - CHART.bottom
  const x = (time: number) =>
    CHART.left + ((time - first) / (last - first)) * plotWidth
  const y = (value: number) =>
    CHART.top + ((max - value) / (max - min)) * plotHeight
  const invert = (svgX: number) =>
    first + ((svgX - CHART.left) / plotWidth) * (last - first)
  const yTicks: number[] = []
  for (let value = min; value <= max + 1e-9; value += step) {
    yTicks.push(Math.round(value * 100) / 100)
  }
  return { x, y, invert, first, last, yTicks, height }
}

export type TimeScales = ReturnType<typeof timeScales>

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

export function linePath<T extends TimePoint>(
  points: T[],
  value: (point: T) => number,
  x: (time: number) => number,
  y: (value: number) => number,
) {
  return points
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'}${x(point.time).toFixed(1)},${y(value(point)).toFixed(1)}`,
    )
    .join(' ')
}

// Точка, ближайшая по времени к позиции курсора
export function nearestIndex(points: TimePoint[], time: number) {
  let best = 0
  points.forEach((point, index) => {
    if (Math.abs(point.time - time) < Math.abs(points[best].time - time)) {
      best = index
    }
  })
  return best
}
