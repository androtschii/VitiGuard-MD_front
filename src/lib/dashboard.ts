import type { RiskLevel, TodayRisk } from '@/api/risks'
import type { Vineyard } from '@/api/vineyards'
import { maxLevel } from '@/lib/riskSeries'

export type VineyardToday = {
  vineyard: Vineyard
  // null — оценки на сегодня нет (вне сезона или ещё не рассчитана)
  risk: TodayRisk | null
  worst: RiskLevel | null
}

export type FarmSummary = {
  count: number
  areaHa: number
  high: number
  medium: number
  rows: VineyardToday[]
}

const ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 }

// Сводка для главной (pr-053): число и площадь участков, сколько из них
// сегодня в высоком и среднем риске. Участки — сначала самые опасные
export function summarize(
  vineyards: Vineyard[],
  risks: TodayRisk[] = [],
): FarmSummary {
  const byId = new Map(risks.map((risk) => [risk.vineyard_id, risk]))
  const rows = vineyards.map((vineyard) => {
    const risk = byId.get(vineyard.id) ?? null
    return {
      vineyard,
      risk,
      worst: risk && maxLevel([risk.downy, risk.powdery]),
    }
  })
  rows.sort(
    (a, b) =>
      (a.worst ? ORDER[a.worst] : 3) - (b.worst ? ORDER[b.worst] : 3) ||
      a.vineyard.name.localeCompare(b.vineyard.name),
  )
  return {
    count: vineyards.length,
    areaHa: vineyards.reduce((sum, vineyard) => sum + vineyard.area_ha, 0),
    high: rows.filter((row) => row.worst === 'high').length,
    medium: rows.filter((row) => row.worst === 'medium').length,
    rows,
  }
}
