import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection, Geometry } from 'geojson'

type BoundaryProps = { kind: 'country' | 'district' | 'label'; name?: string }

export type Boundaries = {
  country: Geometry | null
  districts: Geometry[]
}

// Границы страны и районов (geoBoundaries) лежат в public/geo вместе с сайтом:
// схема на главной не зависит от чужих серверов и работает без сети после
// первой загрузки
export async function fetchBoundaries(): Promise<Boundaries> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}geo/moldova-districts.geojson`,
  )
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = (await response.json()) as FeatureCollection<
    Geometry,
    BoundaryProps
  >
  return {
    country:
      data.features.find((item) => item.properties.kind === 'country')
        ?.geometry ?? null,
    districts: data.features
      .filter((item) => item.properties.kind === 'district')
      .map((item) => item.geometry),
  }
}

export function useBoundaries() {
  return useQuery({
    queryKey: ['geo', 'boundaries'],
    queryFn: fetchBoundaries,
    staleTime: Infinity,
  })
}
