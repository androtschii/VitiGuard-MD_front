import { useTodayRisks } from '@/api/risks'
import { RiskLegend } from '@/components/molecules/RiskLegend'

// Легенда поверх карты слева внизу, над масштабной линейкой. Вне сезона
// оценок нет, все участки зелёные — тогда легенда не нужна
export function MapRiskLegend() {
  const { data } = useTodayRisks()
  if (!data?.length) return null
  return (
    <div className="absolute bottom-10 left-2.5 z-10 max-w-60">
      <RiskLegend />
    </div>
  )
}
