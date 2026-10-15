import type { FeatureCollection, MultiPolygon } from 'geojson'
import { api } from './client'

export type OsmVineyardProperties = {
  osm_id: string
  name: string | null
  area_ha: number
}

export type OsmVineyards = FeatureCollection<
  MultiPolygon,
  OsmVineyardProperties
>

// Окно карты «запад,юг,восток,север» (backend/pr-033); сервер отдаёт не больше
// 2000 полигонов и не принимает окно больше 1°
export async function fetchOsmVineyards(bbox: string) {
  const { data } = await api.get<OsmVineyards>('/osm/vineyards', {
    params: { bbox },
  })
  return data
}
