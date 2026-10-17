import type { RiskEntry, RiskLevel, RiskMethod } from '@/api/risks'

// Риск по агромоделям для тестов: день, метод, оценка, уровень и факторы
export function risk(
  day: string,
  method: RiskMethod,
  score: number,
  level: RiskLevel = 'low',
  factors: Record<string, unknown> = {},
): RiskEntry {
  return {
    target_date: day,
    disease: method === 'gubler_thomas' ? 'powdery_mildew' : 'downy_mildew',
    method,
    score,
    level,
    factors,
    updated_at: '2026-06-10T09:00:00Z',
  }
}

// Сезон вокруг 10 июня 2026: заражение 2 июня, инкубация, оидиум растёт;
// с 11 июня — прогноз погоды
export function season(): RiskEntry[] {
  const forecast = (day: string) => ({ forecast: day > '2026-06-10' })
  return [
    risk('2026-06-01', 'three_tens', 0, 'low', forecast('2026-06-01')),
    risk('2026-06-02', 'three_tens', 1, 'high', forecast('2026-06-02')),
    risk('2026-06-02', 'goidanich', 0, 'low', forecast('2026-06-02')),
    risk('2026-06-10', 'goidanich', 0.63, 'medium', {
      infection_day: '2026-06-02',
      progress: 63.4,
      symptoms_expected: false,
      forecast: false,
    }),
    risk('2026-06-01', 'gubler_thomas', 0.2, 'low', {
      index: 20,
      forecast: false,
    }),
    risk('2026-06-10', 'gubler_thomas', 0.8, 'high', {
      index: 80,
      forecast: false,
    }),
    risk('2026-06-11', 'gubler_thomas', 0.5, 'medium', {
      index: 50,
      forecast: true,
    }),
    risk('2026-06-11', 'goidanich', 1, 'high', {
      infection_day: '2026-06-02',
      progress: 100,
      symptoms_expected: true,
      forecast: true,
    }),
  ]
}
