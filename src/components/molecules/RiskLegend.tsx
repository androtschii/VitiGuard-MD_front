import { useTranslation } from 'react-i18next'
import type { RiskLevel } from '@/api/risks'

// Те же цвета, что у заливки участков в VineyardsLayer
const SWATCHES: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
}

// Легенда раскраски участков по риску на сегодня (pr-025)
export function RiskLegend() {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t('risk.mapLegend')}
      className="flex flex-col gap-1.5 rounded-md border border-line bg-surface/95 p-2.5 text-sm shadow-sm"
    >
      <h2 className="text-xs font-medium text-ink">{t('risk.mapLegend')}</h2>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-ink">
        {(Object.keys(SWATCHES) as RiskLevel[]).map((level) => (
          <li key={level} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-3 rounded-sm border border-black/10"
              style={{ backgroundColor: SWATCHES[level] }}
            />
            {t(`risk.levels.${level}`)}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">{t('risk.mapLegendWorst')}</p>
    </section>
  )
}
