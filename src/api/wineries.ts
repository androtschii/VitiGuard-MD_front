import { useQuery } from '@tanstack/react-query'

export type WineryProperties = {
  name: string
  kind: 'winery' | 'shop'
  website?: string
  phone?: string
  city?: string
  // Точка показывает только город: точного адреса в источниках нет
  approximate?: boolean
}

export type Winery = WineryProperties & { lon: number; lat: number }

type WineryCollection = {
  features: {
    properties: WineryProperties
    geometry: { coordinates: [number, number] }
  }[]
}

// Статичный файл из данных OpenStreetMap: доступен и без сети
export const WINERIES_URL = '/wineries.geojson'

async function fetchWineries() {
  const response = await fetch(WINERIES_URL)
  if (!response.ok) throw new Error(String(response.status))
  const { features } = (await response.json()) as WineryCollection
  return features.map(({ properties, geometry: { coordinates } }) => ({
    ...properties,
    lon: coordinates[0],
    lat: coordinates[1],
  }))
}

export function useWineries(enabled = true) {
  return useQuery({
    queryKey: ['wineries'],
    queryFn: fetchWineries,
    staleTime: Infinity,
    enabled,
  })
}

const EARTH_KM = 6371

export function distanceKm(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
) {
  const radians = (value: number) => (value * Math.PI) / 180
  const dLat = radians(to.lat - from.lat)
  const dLon = radians(to.lon - from.lon)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(from.lat)) *
      Math.cos(radians(to.lat)) *
      Math.sin(dLon / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a))
}

export function nearestWineries(
  items: Winery[],
  point: { lat: number; lon: number },
  count = 5,
) {
  return items
    .map((winery) => ({ winery, km: distanceKm(point, winery) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count)
}
