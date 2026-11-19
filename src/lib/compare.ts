import type { VegetationObservation } from '@/api/vegetation'
import type { TimePoint } from '@/lib/timeSeriesChart'

export type NdviPoint = TimePoint & { ndvi: number }
export type PairPoint = TimePoint & { a: number; b: number }

// Сортирует точки по дате и сводит точки с одинаковой календарной датой (в UTC),
// усредняя значение NDVI: на графике исключаются вертикальные скачки и дубли
export function aggregateNdviByDate(points: NdviPoint[]): NdviPoint[] {
  if (points.length === 0) return []
  const sorted = [...points].sort((left, right) => left.time - right.time)
  const groups: { time: number; sum: number; count: number }[] = []

  for (const point of sorted) {
    const day = new Date(point.time).toISOString().slice(0, 10)
    const current = groups[groups.length - 1]
    const currentDay = current
      ? new Date(current.time).toISOString().slice(0, 10)
      : null

    if (current && currentDay === day) {
      current.sum += point.ndvi
      current.count += 1
    } else {
      groups.push({ time: point.time, sum: point.ndvi, count: 1 })
    }
  }

  return groups.map((group) => ({
    time: group.time,
    ndvi: Math.round((group.sum / group.count) * 10_000) / 10_000,
  }))
}

// Снимки без облаков над участком, отсортированные по дате со средним за день
export function clearNdvi(observations: VegetationObservation[]): NdviPoint[] {
  const points = observations.flatMap((item) =>
    item.ndvi
      ? [{ time: Date.parse(item.acquired_at), ndvi: item.ndvi.mean }]
      : [],
  )
  return aggregateNdviByDate(points)
}

// Значение на линии ряда в момент time: между снимками — по прямой, как её
// и рисует график
export function valueAt(series: NdviPoint[], time: number) {
  const after = series.findIndex((point) => point.time >= time)
  if (after === -1) return series[series.length - 1].ndvi
  if (after === 0 || series[after].time === time) return series[after].ndvi
  const before = series[after - 1]
  const next = series[after]
  const share = (time - before.time) / (next.time - before.time)
  return before.ndvi + (next.ndvi - before.ndvi) * share
}

// Два ряда на общих датах: снимки участков приходят в разные дни, поэтому
// точки — все даты обоих рядов в общем для них периоде. За его пределами
// одной из линий нет данных, и сравнивать там нечего
export function pairSeries(a: NdviPoint[], b: NdviPoint[]): PairPoint[] {
  if (a.length === 0 || b.length === 0) return []
  const first = Math.max(a[0].time, b[0].time)
  const last = Math.min(a[a.length - 1].time, b[b.length - 1].time)
  if (first > last) return []
  const times = [...new Set([...a, ...b].map((point) => point.time))]
    .filter((time) => time >= first && time <= last)
    .sort((left, right) => left - right)
  return times.map((time) => ({
    time,
    a: valueAt(a, time),
    b: valueAt(b, time),
  }))
}
