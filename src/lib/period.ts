import { dayTime } from '@/lib/riskSeries'

export type PeriodKind = 'week' | 'month' | 'season' | 'custom'

// Свой период — дни YYYY-MM-DD включительно; пустая граница — без ограничения
export type Period = { kind: PeriodKind; from: string; to: string }

export const SEASON: Period = { kind: 'season', from: '', to: '' }

const DAY = 86_400_000

// Вегетационный сезон — с 1 марта, как расчёт индексов на сервере
// (backend/pr-060); до марта — прошлогодний
export function seasonStart(day: string) {
  const [year, month] = day.split('-').map(Number)
  return Date.UTC(month >= 3 ? year : year - 1, 2, 1)
}

// Неделя, месяц и сезон — назад от опорного дня, а вперёд без границы. Для
// риска опорный день — сегодня, и прогноз после него остаётся на графике; для
// снимков — день последнего снимка: зимой и в облачные недели новых снимков нет
export function periodRange(period: Period, reference: string) {
  const start = dayTime(reference)
  switch (period.kind) {
    case 'week':
      return { from: start - 7 * DAY, to: Infinity }
    case 'month':
      return { from: start - 30 * DAY, to: Infinity }
    case 'season':
      return { from: seasonStart(reference), to: Infinity }
    case 'custom':
      return {
        from: period.from ? dayTime(period.from) : -Infinity,
        to: period.to ? dayTime(period.to) + DAY - 1 : Infinity,
      }
  }
}

export function inPeriod<T>(
  items: T[],
  time: (item: T) => number,
  range: { from: number; to: number },
) {
  return items.filter((item) => {
    const moment = time(item)
    return moment >= range.from && moment <= range.to
  })
}
