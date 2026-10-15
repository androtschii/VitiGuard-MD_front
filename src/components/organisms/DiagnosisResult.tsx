import { useTranslation } from 'react-i18next'
import type { Diagnosis } from '@/api/diagnosis'
import { cn } from '@/lib/cn'

type DiagnosisResultProps = {
  diagnosis: Diagnosis
}

export function DiagnosisResult({ diagnosis }: DiagnosisResultProps) {
  const { t, i18n } = useTranslation()
  const percent = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const isHealthy = diagnosis.disease === 'healthy'

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-rise">
      <div>
        <p className="text-sm text-ink-subtle">{t('diagnosis.verdict')}</p>
        <p
          className={cn(
            'text-2xl font-semibold',
            // Зелёный — растительность, как участки на карте; болезнь — красный
            isHealthy
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-danger',
          )}
        >
          {t(`diseases.${diagnosis.disease}`)}
        </p>
        <p className="text-sm text-ink-muted">
          {t('diagnosis.confidence', {
            value: percent.format(diagnosis.confidence),
          })}
        </p>
      </div>

      {diagnosis.low_confidence && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          {t('diagnosis.lowConfidence')}
        </p>
      )}

      <section aria-labelledby="diagnosis-probabilities">
        <h3
          id="diagnosis-probabilities"
          className="mb-2 text-sm font-semibold text-ink"
        >
          {t('diagnosis.probabilities')}
        </h3>
        <ul className="flex flex-col gap-2">
          {diagnosis.top.map(({ disease, probability }, index) => (
            <li key={disease} className="text-sm">
              <div className="flex justify-between gap-2 text-ink-soft">
                <span>{t(`diseases.${disease}`)}</span>
                <span className="tabular-nums">
                  {percent.format(probability)}
                </span>
              </div>
              {/* Полоса дублирует число, поэтому скрыта от экранного диктора */}
              <div
                aria-hidden="true"
                className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    'h-full origin-left rounded-full motion-safe:animate-fill',
                    index === 0 ? 'bg-brand-600' : 'bg-brand-300',
                  )}
                  style={{ width: `${Math.max(probability * 100, 1)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-ink-subtle">
        {t('diagnosis.model', { name: diagnosis.model })}
        <br />
        {t('diagnosis.disclaimer')}
      </p>
    </div>
  )
}
