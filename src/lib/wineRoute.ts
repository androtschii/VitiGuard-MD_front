import { distanceKm } from '@/api/wineries'

export type RouteStop = { name: string; lat: number; lon: number }

// Больше за день не объехать, а навигатор не примет длинную ссылку
export const MAX_STOPS = 8

// Первая точка остаётся началом, дальше каждый раз едем к ближайшей: порядок
// не строго лучший, но понятный и без внешнего сервиса маршрутов
export function orderStops(stops: RouteStop[]) {
  const [first, ...rest] = stops
  if (!first) return []
  const ordered = [first]
  while (rest.length > 0) {
    const from = ordered[ordered.length - 1]
    let best = 0
    rest.forEach((stop, index) => {
      if (distanceKm(from, stop) < distanceKm(from, rest[best])) best = index
    })
    ordered.push(...rest.splice(best, 1))
  }
  return ordered
}

export function routeLengthKm(stops: RouteStop[]) {
  return stops.reduce((sum, stop, index) => {
    const previous = stops[index - 1]
    return previous ? sum + distanceKm(previous, stop) : sum
  }, 0)
}

export function directionsUrl(stops: RouteStop[]) {
  // Пяти знаков хватает с точностью до метра, а ссылка остаётся короткой
  const round = (value: number) => Number(value.toFixed(5))
  const points = stops
    .map((stop) => `${round(stop.lat)},${round(stop.lon)}`)
    .join('/')
  return `https://www.google.com/maps/dir/${points}`
}
