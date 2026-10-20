import type { RiskEntry } from '@/api/risks'

// Рекомендации агроному на день (pr-059) — из тех же агромоделей, что риск:
// не новый прогноз, а перевод состояния моделей в действие
export type Advice =
  | 'downyInfection'
  | 'downySymptoms'
  | 'downyIncubation'
  | 'powderyHigh'
  | 'powderyMedium'
  | 'calm'

export function dayAdvice(entries: RiskEntry[], day: string): Advice[] {
  const items = entries.filter((entry) => entry.target_date === day)
  const byMethod = (method: RiskEntry['method']) =>
    items.find((entry) => entry.method === method)
  const advice: Advice[] = []

  // Первичное заражение по правилу «трёх десяток»
  if (byMethod('three_tens')?.score === 1) advice.push('downyInfection')

  // Инкубация по Гойданичу: ждём пятна — осмотр; близко к концу — тоже
  const goidanich = byMethod('goidanich')
  if (goidanich?.factors?.symptoms_expected === true)
    advice.push('downySymptoms')
  else if (goidanich?.level === 'medium') advice.push('downyIncubation')

  // Индекс Gubler-Thomas: от 60 — высокий, от 30 — средний
  const gubler = byMethod('gubler_thomas')
  if (gubler?.level === 'high') advice.push('powderyHigh')
  else if (gubler?.level === 'medium') advice.push('powderyMedium')

  return advice.length ? advice : ['calm']
}
