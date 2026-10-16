import { useQuery } from '@tanstack/react-query'
import { api } from './client'

// Текущая погода в точке (backend/pr-071, Open-Meteo)
export type CurrentWeather = {
  observed_at: string
  temperature_c: number
  relative_humidity: number
  precipitation_mm: number
}

export async function fetchCurrentWeather(latitude: number, longitude: number) {
  const { data } = await api.get<CurrentWeather>('/weather/current', {
    params: { latitude, longitude },
  })
  return data
}

// Точка округляется до 0,01° (около километра): погода в соседних точках
// участка одна и та же, и ответ берётся из кэша
export function useCurrentWeather(point: [number, number] | null) {
  const [lon, lat] = point
    ? point.map((value) => Math.round(value * 100) / 100)
    : [0, 0]
  return useQuery({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => fetchCurrentWeather(lat, lon),
    enabled: point !== null,
    // Open-Meteo обновляет текущую погоду раз в 15 минут
    staleTime: 15 * 60_000,
  })
}
