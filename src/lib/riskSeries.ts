import type { RiskEntry, RiskLevel } from '@/api/risks'

const ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 }

export function maxLevel(levels: RiskLevel[]): RiskLevel {
  return levels.reduce<RiskLevel>(
    (worst, level) => (ORDER[level] > ORDER[worst] ? level : worst),
    'low',
  )
}

// Сегодня на участке: агромодели считают местные сутки Кишинёва
export function localToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Chisinau',
  }).format(now)
}

export const dayTime = (day: string) => Date.parse(`${day}T00:00:00Z`)

export type DayRisk = {
  day: string
  downy: RiskLevel
  powdery: RiskLevel
  forecast: boolean
}

// Риск по дням: милдью — худшее из «трёх десяток» и модели Гойданича, оидиум
// — индекс Gubler-Thomas
export function dailyRisk(entries: RiskEntry[]): DayRisk[] {
  const days = new Map<string, RiskEntry[]>()
  for (const entry of entries) {
    days.set(entry.target_date, [...(days.get(entry.target_date) ?? []), entry])
  }
  return [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, items]) => ({
      day,
      downy: maxLevel(
        items.filter((i) => i.disease === 'downy_mildew').map((i) => i.level),
      ),
      powdery: maxLevel(
        items.filter((i) => i.disease === 'powdery_mildew').map((i) => i.level),
      ),
      forecast: items.some((i) => i.factors?.forecast === true),
    }))
}

export type IndexPoint = { time: number; value: number }

// Индекс Gubler-Thomas 0..100 и продвижение инкубации милдью 0..100 %
export function methodSeries(
  entries: RiskEntry[],
  method: 'goidanich' | 'gubler_thomas',
): IndexPoint[] {
  return entries
    .filter((entry) => entry.method === method)
    .map((entry) => ({
      time: dayTime(entry.target_date),
      value: Math.round(entry.score * 100),
    }))
}

// Дни, когда по правилу «трёх десяток» возможно первичное заражение
export function infectionDays(entries: RiskEntry[]) {
  return entries
    .filter((entry) => entry.method === 'three_tens' && entry.score === 1)
    .map((entry) => entry.target_date)
}
