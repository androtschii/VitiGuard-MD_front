import type { FeatureCollection, MultiPolygon } from 'geojson'
import type { RiskLevel, TodayRisk } from '@/api/risks'
import type { Vineyard } from '@/api/vineyards'
import { maxLevel } from '@/lib/riskSeries'

// none — оценки на сегодня нет (вне сезона или ещё не пересчитано)
export type MapRisk = RiskLevel | 'none'

type VineyardProperties = { id: string; name: string; risk: MapRisk }

// Худший уровень дня из милдью и оидиума по каждому участку
export function riskByVineyard(risks: TodayRisk[] = []) {
  return new Map(
    risks.map((risk) => [
      risk.vineyard_id,
      maxLevel([risk.downy, risk.powdery]),
    ]),
  )
}

// Участки как GeoJSON для источника карты. id — в свойствах, а не в id объекта:
// MapLibre принимает там только числа, а у участков UUID
// Подписи и попапы берут id и название прямо из объекта на карте, а цвет
// заливки — уровень риска на сегодня
export function toFeatureCollection(
  vineyards: Vineyard[],
  risks: Map<string, RiskLevel> = new Map(),
): FeatureCollection<MultiPolygon, VineyardProperties> {
  return {
    type: 'FeatureCollection',
    features: vineyards.map((vineyard) => ({
      type: 'Feature',
      properties: {
        id: vineyard.id,
        name: vineyard.name,
        risk: risks.get(vineyard.id) ?? 'none',
      },
      geometry: vineyard.geometry,
    })),
  }
}
